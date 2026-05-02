"use client";

import Image from "next/image";
import type { DownloadResult, DownloadLink } from "@/lib/types";
import DownloadLinkRow from "@/components/DownloadLinkRow";

interface Props {
  result: DownloadResult;
  selectedFormat: string;
}

const SOURCE_LABELS: Record<string, string> = {
  fastsaver: "FastSaver",
  aioapi: "AIOAPI",
};

export default function ResultSection({ result, selectedFormat }: Props) {
  // ── Error state ──────────────────────────────────────────────────────────
  if (!result.success) {
    return (
      <div
        className="glass-card rounded-2xl p-6 flex items-start gap-4"
        style={{ borderColor: "rgba(239,68,68,0.3)" }}
      >
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
        >
          ✕
        </div>
        <div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#f87171" }}>
            Download failed
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#9999bb" }}>
            {result.error ?? "An unknown error occurred. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  const links = result.downloadLinks ?? [];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* ── Video metadata header ─────────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex gap-4 items-start border-b" style={{ borderColor: "rgba(203,172,249,0.1)" }}>
        {/* Thumbnail */}
        {result.thumbnail && (
          <div className="shrink-0 relative w-28 sm:w-36 rounded-xl overflow-hidden aspect-video bg-[#0d0d2b]">
            <Image
              src={result.thumbnail}
              alt="Video thumbnail"
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          {result.title && (
            <h2
              className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 mb-2"
              style={{ color: "#e8e8f0" }}
            >
              {result.title}
            </h2>
          )}

          {/* Source badge */}
          {result.source && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(203,172,249,0.1)",
                border: "1px solid rgba(203,172,249,0.25)",
                color: "#cbacf9",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              via {SOURCE_LABELS[result.source] ?? result.source}
            </span>
          )}

          {/* Format + link count summary */}
          <p className="mt-2 text-xs" style={{ color: "#6666aa" }}>
            {links.length} link{links.length !== 1 ? "s" : ""} available
            {selectedFormat !== "any" ? ` · ${selectedFormat.toUpperCase()}` : ""}
          </p>
        </div>
      </div>

      {/* ── Download links list ───────────────────────────────────────── */}
      <div className="divide-y" style={{ borderColor: "rgba(203,172,249,0.08)" }}>
        {links.length === 0 ? (
          <p className="px-6 py-5 text-sm text-center" style={{ color: "#6666aa" }}>
            No download links found for the selected format.
          </p>
        ) : (
          links.map((link: DownloadLink, i: number) => (
            <DownloadLinkRow key={`${link.url}-${i}`} link={link} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
