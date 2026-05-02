/**
 * GET /api/video/download?url=...&formatId=...&filename=...
 *
 * Streams the video/audio back to the browser as a file download.
 * Routes to ytdl-core for YouTube, yt-dlp for everything else.
 */

import { NextRequest } from "next/server";
import { isValidUrl } from "@/lib/validation";
import { detectPlatformId } from "@/lib/platform-detector";
import { streamYouTubeVideo } from "@/lib/youtube";
import { streamYtDlpVideo } from "@/lib/ytdlp";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min for large videos

export async function GET(request: NextRequest): Promise<Response> {
  const sp = request.nextUrl.searchParams;
  const url = sp.get("url");
  const formatId = sp.get("formatId") ?? "best";
  const filename = sp.get("filename") ?? "video.mp4";

  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isValidUrl(url)) {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  const platform = detectPlatformId(url);

  try {
    let nodeStream: NodeJS.ReadableStream;

    if (platform === "youtube") {
      try {
        nodeStream = await streamYouTubeVideo(url, formatId);
      } catch (ytdlErr) {
        console.warn("[video/download] ytdl-core failed, falling back to yt-dlp:", ytdlErr);
        nodeStream = await streamYtDlpVideo(url, formatId);
      }
    } else {
      nodeStream = await streamYtDlpVideo(url, formatId);
    }

    // Convert Node.js Readable → Web API ReadableStream robustly
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        if (typeof (nodeStream as any).destroy === "function") {
          (nodeStream as any).destroy();
        }
      },
    });

    const ext = filename.split(".").pop()?.toLowerCase() ?? "mp4";
    const contentType =
      ext === "mp3" ? "audio/mpeg" :
      ext === "m4a" ? "audio/mp4" :
      ext === "webm" ? "video/webm" :
      "video/mp4";

    const safeFilename = encodeURIComponent(filename.replace(/[/\\:*?"<>|]/g, "_"));

    return new Response(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[video/download] Error:", err);
    const message = err instanceof Error ? err.message : "Download failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
