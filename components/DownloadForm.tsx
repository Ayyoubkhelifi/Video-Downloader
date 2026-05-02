"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { isValidUrl, detectPlatform } from "@/lib/validation";
import type { VideoInfo, VideoFormat, VideoInfoResult } from "@/lib/types";

// ─── Platform pill icons ──────────────────────────────────────────────────────
const PLATFORM_ICONS: Record<string, string> = {
  YouTube: "▶",
  Instagram: "◈",
  TikTok: "♪",
  "X / Twitter": "✕",
  Facebook: "ƒ",
  Vimeo: "◉",
};

function formatDuration(secs?: number): string {
  if (!secs || isNaN(secs)) return "";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function buildDownloadUrl(
  videoUrl: string,
  fmt: VideoFormat,
  title: string
): string {
  const ext = fmt.format || "mp4";
  const safeTitle = title
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60) || "video";
  const params = new URLSearchParams({
    url: videoUrl,
    formatId: fmt.formatId,
    filename: `${safeTitle}.${ext}`,
  });
  return `/api/video/download?${params.toString()}`;
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function InfoSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden mt-6 animate-fade-in-up">
      <div className="p-5 sm:p-6 flex gap-4 border-b" style={{ borderColor: "rgba(203,172,249,0.1)" }}>
        <div className="shimmer-bg shrink-0 w-28 sm:w-36 rounded-xl aspect-video" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="shimmer-bg h-4 rounded-lg w-3/4" />
          <div className="shimmer-bg h-3 rounded-lg w-1/2" />
          <div className="shimmer-bg h-3 rounded-lg w-1/3" />
        </div>
      </div>
      <div className="p-5 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer-bg h-9 w-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Format quality button ─────────────────────────────────────────────────────
function FormatButton({
  fmt,
  selected,
  onClick,
}: {
  fmt: VideoFormat;
  selected: boolean;
  onClick: () => void;
}) {
  const isAudio = !fmt.hasVideo;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
      style={
        selected
          ? {
              background: isAudio
                ? "rgba(16,185,129,0.18)"
                : "rgba(203,172,249,0.18)",
              border: isAudio
                ? "1px solid rgba(16,185,129,0.6)"
                : "1px solid rgba(203,172,249,0.6)",
              color: isAudio ? "#6ee7b7" : "#cbacf9",
              boxShadow: isAudio
                ? "0 0 12px rgba(16,185,129,0.2)"
                : "0 0 12px rgba(203,172,249,0.2)",
            }
          : {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(203,172,249,0.12)",
              color: "#8884a8",
            }
      }
    >
      <span>{fmt.quality}</span>
      {fmt.size && (
        <span className="font-normal opacity-70 mt-0.5">{fmt.size}</span>
      )}
      <span
        className="uppercase font-bold mt-0.5"
        style={{ fontSize: "0.65rem", opacity: 0.6 }}
      >
        {fmt.format}
      </span>
    </button>
  );
}

// ─── Video info panel ─────────────────────────────────────────────────────────
function VideoInfoPanel({
  info,
  selectedFormat,
  onSelectFormat,
}: {
  info: VideoInfo;
  selectedFormat: VideoFormat | null;
  onSelectFormat: (fmt: VideoFormat) => void;
}) {
  const videoFormats = info.formats.filter((f) => f.hasVideo);
  const audioFormats = info.formats.filter((f) => !f.hasVideo);
  const duration = formatDuration(info.duration);

  return (
    <div className="glass-card rounded-2xl overflow-hidden mt-6 animate-fade-in-up">
      {/* ── Metadata header ─────────────────────────────────────────────── */}
      <div
        className="p-5 sm:p-6 flex gap-4 items-start border-b"
        style={{ borderColor: "rgba(203,172,249,0.1)" }}
      >
        {info.thumbnail && (
          <div className="shrink-0 relative w-28 sm:w-36 rounded-xl overflow-hidden aspect-video bg-[#0d0d2b]">
            <Image
              src={info.thumbnail}
              alt="Thumbnail"
              fill
              sizes="(max-width:640px) 112px, 144px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2
            className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 mb-2"
            style={{ color: "#e8e8f0" }}
          >
            {info.title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "#7070aa" }}>
            {/* Platform badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(203,172,249,0.08)",
                border: "1px solid rgba(203,172,249,0.2)",
                color: "#cbacf9",
              }}
            >
              <span>{PLATFORM_ICONS[info.platform] ?? "⬇"}</span>
              <span>{info.platform}</span>
            </span>

            {info.author && <span>by {info.author}</span>}
            {duration && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                ⏱ {duration}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs" style={{ color: "#4a4a6a" }}>
            {info.formats.length} format{info.formats.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* ── Format selector ──────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 space-y-4">
        {videoFormats.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "rgba(203,172,249,0.4)" }}
            >
              Video
            </p>
            <div className="flex flex-wrap gap-2">
              {videoFormats.map((fmt) => (
                <FormatButton
                  key={fmt.formatId}
                  fmt={fmt}
                  selected={selectedFormat?.formatId === fmt.formatId}
                  onClick={() => onSelectFormat(fmt)}
                />
              ))}
            </div>
          </div>
        )}

        {audioFormats.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "rgba(16,185,129,0.5)" }}
            >
              Audio only
            </p>
            <div className="flex flex-wrap gap-2">
              {audioFormats.map((fmt) => (
                <FormatButton
                  key={fmt.formatId}
                  fmt={fmt}
                  selected={selectedFormat?.formatId === fmt.formatId}
                  onClick={() => onSelectFormat(fmt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Download button ────────────────────────────────────────────── */}
        {selectedFormat ? (
          <a
            id="download-button"
            href={buildDownloadUrl(info.url, selectedFormat, info.title)}
            className="mt-2 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-3 transition-all duration-300 hover:brightness-110 hover:scale-[1.01]"
            style={{
              background: !selectedFormat.hasVideo
                ? "linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)"
                : "linear-gradient(135deg, #cbacf9 0%, #a78bda 100%)",
              color: "#0d0d2b",
              boxShadow: !selectedFormat.hasVideo
                ? "0 0 24px rgba(16,185,129,0.35)"
                : "0 0 24px rgba(203,172,249,0.35)",
            }}
          >
            <span style={{ fontSize: "1.1em" }}>⬇</span>
            <span>
              Download {selectedFormat.quality} {selectedFormat.format.toUpperCase()}
            </span>
          </a>
        ) : (
          <div
            className="mt-2 w-full py-3.5 rounded-xl text-sm text-center font-medium"
            style={{
              background: "rgba(203,172,249,0.06)",
              border: "1px dashed rgba(203,172,249,0.2)",
              color: "#5c5c8a",
            }}
          >
            ↑ Choose a format above to download
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DownloadForm() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [infoError, setInfoError] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived
  const platform = url.trim() ? detectPlatform(url) : null;
  const platformIcon = platform ? PLATFORM_ICONS[platform] ?? "⬇" : null;

  // Auto-fetch info when URL is valid (debounced 700ms)
  const fetchInfo = useCallback(async (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed || !isValidUrl(trimmed)) return;

    setInfoLoading(true);
    setInfoError("");
    setVideoInfo(null);
    setSelectedFormat(null);

    try {
      const res = await fetch("/api/video/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data: VideoInfoResult = await res.json();

      if (!data.success || !data.info) {
        setInfoError(data.error ?? "Could not load video info.");
        return;
      }

      setVideoInfo(data.info);
      // Auto-select best combined format
      const best =
        data.info.formats.find((f) => f.hasVideo && f.hasAudio) ??
        data.info.formats[0] ??
        null;
      setSelectedFormat(best);
    } catch {
      setInfoError("Could not reach the server. Please check your connection.");
    } finally {
      setInfoLoading(false);
    }
  }, []);

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setUrl(val);
    setUrlError("");
    setInfoError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setVideoInfo(null);
      setSelectedFormat(null);
      setInfoLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (isValidUrl(val)) fetchInfo(val);
    }, 700);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted && isValidUrl(pasted)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Small delay so the input value is set first
      setTimeout(() => fetchInfo(pasted), 100);
    }
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleClear() {
    setUrl("");
    setVideoInfo(null);
    setSelectedFormat(null);
    setInfoError("");
    setUrlError("");
    setInfoLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  }

  return (
    <div className="w-full">
      {/* ── URL input card ─────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="space-y-2">
          <label
            htmlFor="video-url"
            className="block text-sm font-medium"
            style={{ color: "#cbacf9" }}
          >
            Paste a video URL
          </label>

          <div className="relative">
            {/* Platform pill (left) */}
            {platform && platform !== "Unknown" && (
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full pointer-events-none"
                style={{
                  background: "rgba(203,172,249,0.12)",
                  color: "#cbacf9",
                  border: "1px solid rgba(203,172,249,0.3)",
                }}
              >
                <span>{platformIcon}</span>
                <span>{platform}</span>
              </div>
            )}

            <input
              ref={inputRef}
              id="video-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={handleUrlChange}
              onPaste={handlePaste}
              className={[
                "w-full rounded-xl px-4 py-3.5 text-sm outline-none",
                "transition-all duration-200",
                platform && platform !== "Unknown" ? "pl-28" : "",
                url ? "pr-10" : "",
                urlError ? "ring-2 ring-red-500/60" : "focus:ring-2 focus:ring-[#cbacf9]/50",
              ]
                .join(" ")}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: urlError
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(203,172,249,0.2)",
                color: "#e8e8f0",
              }}
            />

            {/* Clear button (right) */}
            {url && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear URL"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-150"
                style={{
                  background: "rgba(203,172,249,0.1)",
                  color: "#8884a8",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {urlError && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#f87171" }}>
              <span>⚠</span> {urlError}
            </p>
          )}
        </div>

        {/* Inline loading indicator inside the card */}
        {infoLoading && (
          <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "#7070aa" }}>
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            <span>Fetching video info…</span>
          </div>
        )}

        {/* Inline error */}
        {infoError && !infoLoading && (
          <div
            className="mt-4 flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span style={{ color: "#f87171", fontSize: "1rem" }}>✕</span>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#f87171" }}>
                Could not load video
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#9999bb" }}>
                {infoError}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Skeleton ───────────────────────────────────────────────────── */}
      {infoLoading && <InfoSkeleton />}

      {/* ── Video info + format selector ───────────────────────────────── */}
      {videoInfo && !infoLoading && (
        <VideoInfoPanel
          info={videoInfo}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
        />
      )}
    </div>
  );
}
