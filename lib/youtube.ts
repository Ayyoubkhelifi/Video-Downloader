/**
 * YouTube handler using @distube/ytdl-core (maintained fork of ytdl-core).
 * Provides metadata fetching and video streaming.
 */

import ytdl from "@distube/ytdl-core";
import type { VideoInfo, VideoFormat } from "./types";

function formatBytes(bytes?: number | string | null): string | undefined {
  if (bytes == null) return undefined;
  const n = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(n) || n === 0) return undefined;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export async function getYouTubeInfo(url: string): Promise<VideoInfo> {
  const info = await ytdl.getInfo(url);
  const { videoDetails, formats: raw } = info;

  const formats: VideoFormat[] = [];
  const seen = new Set<string>();

  // 1. Video + Audio combined (most compatible, sorted by height desc)
  const combined = raw
    .filter((f) => f.hasVideo && f.hasAudio)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  for (const f of combined) {
    const key = `${f.height}-${f.container}`;
    if (seen.has(key)) continue;
    seen.add(key);
    formats.push({
      formatId: String(f.itag),
      quality: f.qualityLabel ?? `${f.height}p`,
      format: f.container ?? "mp4",
      hasVideo: true,
      hasAudio: true,
      height: f.height ?? undefined,
      size: formatBytes(f.contentLength),
      codec: f.codecs,
    });
  }

  // 2. Audio-only (top 3 by bitrate)
  const audioOnly = raw
    .filter((f) => !f.hasVideo && f.hasAudio)
    .sort((a, b) => (b.audioBitrate ?? 0) - (a.audioBitrate ?? 0));

  for (const f of audioOnly.slice(0, 3)) {
    const key = `audio-${f.audioBitrate}-${f.container}`;
    if (seen.has(key)) continue;
    seen.add(key);
    formats.push({
      formatId: String(f.itag),
      quality: `Audio ${f.audioBitrate ?? ""}kbps`,
      format: f.container ?? "m4a",
      hasVideo: false,
      hasAudio: true,
      audioBitrate: f.audioBitrate ?? undefined,
      size: formatBytes(f.contentLength),
    });
  }

  const thumbnail = videoDetails.thumbnails
    ?.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;

  return {
    url,
    platform: "YouTube",
    title: videoDetails.title,
    thumbnail,
    duration: parseInt(videoDetails.lengthSeconds, 10),
    author: videoDetails.author?.name ?? videoDetails.ownerChannelName,
    formats,
  };
}

export async function streamYouTubeVideo(
  url: string,
  formatId: string
): Promise<NodeJS.ReadableStream> {
  const info = await ytdl.getInfo(url);
  const quality = isNaN(Number(formatId)) ? formatId : Number(formatId);
  const format = ytdl.chooseFormat(info.formats, { quality });
  return ytdl.downloadFromInfo(info, { format });
}
