/**
 * Input validation utilities.
 */

/** Returns true if the string is a valid, parseable URL with http/https protocol. */
export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Detect which platform the URL belongs to (for display purposes). */
export function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("tiktok.com")) return "TikTok";
    if (host.includes("twitter.com") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("facebook.com") || host.includes("fb.watch")) return "Facebook";
    if (host.includes("vimeo.com")) return "Vimeo";
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

/** Supported download formats shown in the UI. */
export const SUPPORTED_FORMATS = [
  { value: "mp4", label: "MP4 – Video" },
  { value: "mp3", label: "MP3 – Audio only" },
  { value: "webm", label: "WebM – Video" },
  { value: "any", label: "Any – Best available" },
] as const;

export type Format = (typeof SUPPORTED_FORMATS)[number]["value"];
