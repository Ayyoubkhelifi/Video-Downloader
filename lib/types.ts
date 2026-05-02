/**
 * Shared types for the Universal Video Downloader API.
 */

// ─── New self-hosted API types ─────────────────────────────────────────────────

export interface VideoFormat {
  /** Platform-specific format identifier (e.g. itag for YouTube, format_id for yt-dlp) */
  formatId: string;
  /** Human-readable quality label: "1080p", "720p", "Audio 128kbps", etc. */
  quality: string;
  /** Container format: "mp4", "webm", "m4a", "mp3" */
  format: string;
  /** Whether this format includes a video track */
  hasVideo: boolean;
  /** Whether this format includes an audio track */
  hasAudio: boolean;
  /** Human-readable file size, e.g. "14.2 MB" */
  size?: string;
  /** Video height in pixels */
  height?: number;
  /** Audio bitrate in kbps */
  audioBitrate?: number;
  /** Video codec string */
  codec?: string;
}

export interface VideoInfo {
  url: string;
  platform: string;
  title: string;
  thumbnail?: string;
  /** Duration in seconds */
  duration?: number;
  author?: string;
  formats: VideoFormat[];
}

export interface VideoInfoResult {
  success: boolean;
  info?: VideoInfo;
  error?: string;
}

// ─── Legacy types (kept for /api/download backwards compat) ───────────────────

export interface DownloadLink {
  quality: string;
  format: string;
  url: string;
  size?: string;
  mimeType?: string;
}

export interface DownloadResult {
  success: boolean;
  source?: string;
  downloadLinks?: DownloadLink[];
  title?: string;
  thumbnail?: string;
  error?: string;
  hosting?: string;
  mediaType?: string;
  shortcode?: string;
  message?: string;
  telegramFileId?: string;
  telegramBotUsername?: string;
}

export interface DownloadRequest {
  url: string;
  format: string;
}
