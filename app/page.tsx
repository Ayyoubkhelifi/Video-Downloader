import DownloadForm from "@/components/DownloadForm";

// Supported platform logos (SVG inline, no external images needed)
const PLATFORMS = [
  { name: "YouTube",   icon: "▶", color: "#ff4444" },
  { name: "Instagram", icon: "◈", color: "#e1306c" },
  { name: "TikTok",    icon: "♪", color: "#cbacf9" },
  { name: "Twitter",   icon: "✕", color: "#1d9bf0" },
  { name: "Facebook",  icon: "ƒ", color: "#1877f2" },
  { name: "Vimeo",     icon: "◉", color: "#19b7ea" },
];

export default function Home() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center overflow-x-hidden"
      style={{ background: "#000319" }}
    >
      {/* ── Decorative background orbs ────────────────────────────────── */}
      <div
        className="orb w-[500px] h-[500px] -top-32 -left-32 opacity-30"
        style={{ background: "radial-gradient(circle, #3b1f6a 0%, transparent 70%)" }}
      />
      <div
        className="orb w-[400px] h-[400px] top-1/2 -right-48 opacity-20"
        style={{ background: "radial-gradient(circle, #cbacf9 0%, transparent 70%)" }}
      />
      <div
        className="orb w-[350px] h-[350px] bottom-0 left-1/4 opacity-15"
        style={{ background: "radial-gradient(circle, #4c1d95 0%, transparent 70%)" }}
      />

      {/* ── Header / Hero ─────────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-16 pb-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
          style={{
            background: "rgba(203,172,249,0.1)",
            border: "1px solid rgba(203,172,249,0.25)",
            color: "#cbacf9",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Free · No sign-up required · Instant
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          <span style={{ color: "#e8e8f0" }}>Universal</span>{" "}
          <span className="gradient-text">Video Downloader</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto" style={{ color: "#7070aa" }}>
          Paste any video link and download in your preferred format — MP4, MP3, and more.
        </p>

        {/* Platform pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {PLATFORMS.map((p) => (
            <span
              key={p.name}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#7070aa",
              }}
            >
              <span style={{ color: p.color }}>{p.icon}</span>
              {p.name}
            </span>
          ))}
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <section
        className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-20"
        aria-label="Download tool"
      >
        <DownloadForm />
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section
        className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-20"
        aria-labelledby="how-it-works-heading"
      >
        <h2
          id="how-it-works-heading"
          className="text-center text-xs uppercase tracking-widest font-semibold mb-6"
          style={{ color: "rgba(203,172,249,0.4)" }}
        >
          How it works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Paste URL",     desc: "Copy the video link from any supported platform."       },
            { step: "02", title: "Choose Format", desc: "Select MP4 for video or MP3 for audio-only."            },
            { step: "03", title: "Download",      desc: "Click the link to download directly to your device."     },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="glass-card rounded-2xl p-5 text-center space-y-2"
            >
              <div
                className="text-2xl font-black mx-auto w-fit"
                style={{ color: "rgba(203,172,249,0.2)" }}
              >
                {step}
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "#cbacf9" }}>
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "#5c5c8a" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t text-center py-6 px-4"
        style={{ borderColor: "rgba(203,172,249,0.08)", color: "#3a3a5c" }}
      >
        <p className="text-xs">
          Universal Video Downloader &mdash; For personal use only. Respect copyright laws.
        </p>
      </footer>
    </main>
  );
}
