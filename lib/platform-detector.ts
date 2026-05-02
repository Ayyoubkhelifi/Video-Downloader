/**
 * Detects the social media platform from a URL and returns a canonical platform ID.
 */

export type Platform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "vimeo"
  | "unknown";

export function detectPlatformId(url: string): Platform {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("twitter.com") || host.includes("x.com"))
      return "twitter";
    if (
      host.includes("facebook.com") ||
      host.includes("fb.watch") ||
      host.includes("fb.com")
    )
      return "facebook";
    if (host.includes("vimeo.com")) return "vimeo";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  facebook: "Facebook",
  vimeo: "Vimeo",
  unknown: "Unknown",
};
