/**
 * Universal yt-dlp handler via yt-dlp-wrap.
 *
 * On first use the yt-dlp binary is auto-downloaded from GitHub into ./bin/.
 * Works for Instagram, TikTok, Twitter/X, Facebook, Vimeo, and 1000+ other sites.
 */

import YtDlpWrap from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import type { VideoInfo, VideoFormat } from "./types";

import os from "os";

// In serverless environments like Netlify/Vercel, the file system is read-only except for /tmp
const isServerless = process.env.NODE_ENV === "production" || process.env.NETLIFY;
const BINARY_DIR = isServerless 
  ? path.join(os.tmpdir(), "ytdlp-bin") 
  : path.join(process.cwd(), "bin");

const BINARY_PATH = path.join(
  BINARY_DIR,
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
);

let _instance: YtDlpWrap | null = null;
let _initPromise: Promise<YtDlpWrap> | null = null;

async function getInstance(): Promise<YtDlpWrap> {
  if (_instance) return _instance;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (!fs.existsSync(BINARY_PATH)) {
      console.log("[yt-dlp] Binary not found – downloading from GitHub…");
      fs.mkdirSync(BINARY_DIR, { recursive: true });
      const release = await YtDlpWrap.getGithubReleases(1, 1);
      const version = release[0].tag_name;
      const isWin32 = process.platform === "win32";
      const isMac = process.platform === "darwin";
      const fileName = isWin32 ? "yt-dlp.exe" : isMac ? "yt-dlp_macos" : "yt-dlp_linux";
      const fileURL = `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${fileName}`;
      
      console.log(`[yt-dlp] Downloading ${fileName} (${version})…`);
      await YtDlpWrap.downloadFile(fileURL, BINARY_PATH);
      if (!isWin32) fs.chmodSync(BINARY_PATH, "777");
      console.log("[yt-dlp] Binary ready at", BINARY_PATH);
    }
    _instance = new YtDlpWrap(BINARY_PATH);
    return _instance;
  })();

  return _initPromise;
}

function fmtBytes(bytes?: number | null): string | undefined {
  if (!bytes) return undefined;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseFormats(rawFormats: any[]): VideoFormat[] {
  const formats: VideoFormat[] = [];
  const seen = new Set<string>();

  const sorted = [...rawFormats].sort((a, b) => {
    const aFull = a.vcodec !== "none" && a.acodec !== "none";
    const bFull = b.vcodec !== "none" && b.acodec !== "none";
    if (aFull && !bFull) return -1;
    if (bFull && !aFull) return 1;
    return (b.height ?? 0) - (a.height ?? 0);
  });

  for (const f of sorted) {
    if (f.ext === "mhtml" || f.ext === "none") continue;

    const hasVideo = f.vcodec && f.vcodec !== "none";
    const hasAudio = f.acodec && f.acodec !== "none";
    if (!hasVideo && !hasAudio) continue;

    let quality: string;
    if (hasVideo && hasAudio) {
      quality = f.height ? `${f.height}p` : f.format_note ?? "Best";
    } else if (hasVideo) {
      quality = f.height ? `${f.height}p (video)` : "Video only";
    } else {
      quality = f.abr ? `Audio ${Math.round(f.abr)}kbps` : "Audio only";
    }

    const key = `${quality}-${f.ext}`;
    if (seen.has(key)) continue;
    if (formats.length >= 12) break;
    seen.add(key);

    formats.push({
      formatId: String(f.format_id),
      quality,
      format: f.ext ?? "mp4",
      hasVideo: !!hasVideo,
      hasAudio: !!hasAudio,
      height: f.height ?? undefined,
      audioBitrate: f.abr ?? undefined,
      size: fmtBytes(f.filesize ?? f.filesize_approx),
    });
  }

  return formats;
}

export async function getYtDlpInfo(url: string): Promise<VideoInfo> {
  const ytdlp = await getInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await ytdlp.getVideoInfo(url);

  const formats = raw.formats ? parseFormats(raw.formats) : [];

  if (formats.length === 0) {
    formats.push({
      formatId: "best",
      quality: "Best available",
      format: raw.ext ?? "mp4",
      hasVideo: true,
      hasAudio: true,
    });
  }

  return {
    url,
    platform: "Unknown",
    title: raw.title ?? "Untitled",
    thumbnail: raw.thumbnail,
    duration: raw.duration,
    author: raw.uploader ?? raw.channel ?? raw.creator,
    formats,
  };
}

export async function streamYtDlpVideo(
  url: string,
  formatId: string
): Promise<NodeJS.ReadableStream> {
  const ytdlp = await getInstance();
  const fmt = formatId === "best" ? "bestvideo+bestaudio/best" : formatId;
  return ytdlp.execStream([
    url,
    "-f", fmt,
    "--merge-output-format", "mp4",
    "-o", "-",
    "--no-playlist",
  ]);
}
