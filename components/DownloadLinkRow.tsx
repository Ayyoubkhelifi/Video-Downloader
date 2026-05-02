"use client";

import { useState } from "react";
import type { DownloadLink } from "@/lib/types";

interface Props {
  link: DownloadLink;
  index: number;
}

// Map format strings to human-readable labels
const FORMAT_COLORS: Record<string, { bg: string; text: string }> = {
  mp4:  { bg: "rgba(99,102,241,0.15)",  text: "#a5b4fc" },
  mp3:  { bg: "rgba(16,185,129,0.15)",  text: "#6ee7b7" },
  webm: { bg: "rgba(245,158,11,0.15)",  text: "#fcd34d" },
  m4a:  { bg: "rgba(239,68,68,0.15)",   text: "#fca5a5" },
};

const DEFAULT_FORMAT_COLOR = { bg: "rgba(203,172,249,0.1)", text: "#cbacf9" };

export default function DownloadLinkRow({ link, index }: Props) {
  const [copied, setCopied] = useState(false);

  const fmt = link.format ?? "mp4";
  const fmtColor = FORMAT_COLORS[fmt] ?? DEFAULT_FORMAT_COLOR;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const area = document.createElement("textarea");
      area.value = link.url;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="px-5 sm:px-6 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors duration-150"
    >
      {/* Index */}
      <span
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
        style={{ background: "rgba(203,172,249,0.08)", color: "#8884a8" }}
      >
        {index + 1}
      </span>

      {/* Quality + Format badges */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {link.quality && (
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(203,172,249,0.1)",
              color: "#cbacf9",
              border: "1px solid rgba(203,172,249,0.2)",
            }}
          >
            {link.quality}
          </span>
        )}

        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
          style={{
            background: fmtColor.bg,
            color: fmtColor.text,
          }}
        >
          {fmt}
        </span>

        {link.size && (
          <span className="text-xs" style={{ color: "#6666aa" }}>
            {link.size}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Copy link button */}
        <button
          id={`copy-link-${index}`}
          type="button"
          onClick={handleCopy}
          title="Copy link to clipboard"
          aria-label="Copy download link"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
          style={{
            background: copied ? "rgba(16,185,129,0.15)" : "rgba(203,172,249,0.08)",
            color: copied ? "#6ee7b7" : "#8884a8",
            border: copied
              ? "1px solid rgba(16,185,129,0.3)"
              : "1px solid rgba(203,172,249,0.1)",
          }}
        >
          {copied ? "✓" : "⎘"}
        </button>

        {/* Download button */}
        <a
          id={`download-link-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${link.quality ?? ""} ${fmt}`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #cbacf9 0%, #a78bda 100%)",
            color: "#0d0d2b",
            boxShadow: "0 0 12px rgba(203,172,249,0.2)",
          }}
        >
          <span>↓</span>
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>
    </div>
  );
}
