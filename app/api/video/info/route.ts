/**
 * POST /api/video/info
 *
 * Accepts: { url: string }
 * Returns: VideoInfoResult { success, info: { title, thumbnail, duration, author, formats[] } }
 *
 * Routes to the correct handler based on detected platform:
 *   YouTube  → @distube/ytdl-core
 *   Everything else → yt-dlp-wrap (universal fallback)
 */

import { NextRequest } from "next/server";
import { isValidUrl } from "@/lib/validation";
import { detectPlatformId, PLATFORM_DISPLAY_NAMES } from "@/lib/platform-detector";
import { getYouTubeInfo } from "@/lib/youtube";
import { getYtDlpInfo } from "@/lib/ytdlp";
import type { VideoInfoResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Simple in-process cache (5 min TTL)
const infoCache = new Map<string, { result: VideoInfoResult; exp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function POST(request: NextRequest): Promise<Response> {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return Response.json(
      { success: false, error: "Missing required field: url" },
      { status: 400 }
    );
  }

  if (!isValidUrl(url)) {
    return Response.json(
      { success: false, error: "Invalid URL. Please enter a valid video URL." },
      { status: 400 }
    );
  }

  // Cache hit
  const cached = infoCache.get(url);
  if (cached && Date.now() < cached.exp) {
    return Response.json(cached.result);
  }

  const platform = detectPlatformId(url);

  try {
    let info;

    if (platform === "youtube") {
      console.log("[video/info] YouTube →", url);
      try {
        info = await getYouTubeInfo(url);
      } catch (ytdlErr) {
        console.warn("[video/info] ytdl-core failed, falling back to yt-dlp:", ytdlErr);
        info = await getYtDlpInfo(url);
      }
    } else {
      console.log(`[video/info] yt-dlp (${platform}) →`, url);
      info = await getYtDlpInfo(url);
    }

    // Set canonical display name
    info.platform = PLATFORM_DISPLAY_NAMES[platform] ?? "Unknown";

    const result: VideoInfoResult = { success: true, info };
    infoCache.set(url, { result, exp: Date.now() + CACHE_TTL });

    return Response.json(result);
  } catch (err) {
    console.error("[video/info] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);

    let friendlyError = `Could not fetch video info: ${msg}`;
    if (/unavailable|private|removed|deleted/i.test(msg)) {
      friendlyError = "This video is unavailable or private.";
    } else if (/rate.?limit|429/i.test(msg)) {
      friendlyError = "Rate limited by the platform. Please try again shortly.";
    } else if (/unsupported url/i.test(msg)) {
      friendlyError = "This URL is not supported. Try a direct video link.";
    }

    return Response.json({ success: false, error: friendlyError }, { status: 502 });
  }
}
