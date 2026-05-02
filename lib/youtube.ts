/**
 * YouTube handler using YouTube Data API / oEmbed for metadata fetching (bypassing bot checks)
 * and routing download streaming entirely through yt-dlp.
 */

import type { VideoInfo } from "./types";
import { streamYtDlpVideo } from "./ytdlp";

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function getYouTubeInfo(url: string): Promise<VideoInfo> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Invalid YouTube URL");

  let title = "YouTube Video";
  let author = "YouTube";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let duration = 0;

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      title = item.snippet.title;
      author = item.snippet.channelTitle;
      
      // ISO 8601 duration parsing (PT5M30S)
      const match = item.contentDetails?.duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (match) {
        const hours = (parseInt(match[1]) || 0);
        const minutes = (parseInt(match[2]) || 0);
        const seconds = (parseInt(match[3]) || 0);
        duration = hours * 3600 + minutes * 60 + seconds;
      }
    }
  } else {
    // Fallback to oEmbed which is never blocked and doesn't require an API key
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        title = data.title;
        author = data.author_name;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch (err) {
      console.warn("oEmbed fetch failed", err);
    }
  }

  return {
    url,
    platform: "youtube",
    title,
    thumbnail,
    duration,
    author,
    formats: [
      { formatId: "best", quality: "Best Quality (Auto)", format: "mp4", hasVideo: true, hasAudio: true },
      { formatId: "22", quality: "720p (Pre-merged)", format: "mp4", hasVideo: true, hasAudio: true },
      { formatId: "18", quality: "360p (Pre-merged)", format: "mp4", hasVideo: true, hasAudio: true },
      { formatId: "140", quality: "Audio Only", format: "m4a", hasVideo: false, hasAudio: true },
    ],
  };
}

export async function streamYouTubeVideo(
  url: string,
  formatId: string
): Promise<NodeJS.ReadableStream> {
  // Delegate YouTube streaming entirely to yt-dlp which supports --cookies
  return streamYtDlpVideo(url, formatId);
}
