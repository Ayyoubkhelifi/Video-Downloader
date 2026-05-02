# Universal Video Downloader

> Download videos from YouTube, Instagram, TikTok, X/Twitter, Facebook, Vimeo and more — in MP4, MP3, WebM and other formats.

---

## ✨ Features

- **Multi-platform** – YouTube, Instagram, TikTok, X/Twitter, Facebook, Vimeo
- **Format selection** – MP4, MP3, WebM, or "any best available"
- **Dual-API with fallback** – FastSaverAPI → AIOAPI, each retried once
- **In-memory caching** – repeated requests skip the API entirely
- **Copy-to-clipboard** – share download links instantly
- **Fully responsive** – mobile-first design

---

## 🗂 Project Structure

```
video-downloader/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.ts        # POST /api/download  (route handler)
│   ├── globals.css             # Tailwind v4 + custom tokens
│   ├── layout.tsx              # Root layout + metadata + fonts
│   └── page.tsx                # Home page (server component)
├── components/
│   ├── DownloadForm.tsx        # Interactive form (client component)
│   ├── ResultSection.tsx       # Results / error display
│   └── DownloadLinkRow.tsx     # Single download link row + copy button
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── validation.ts           # URL validation + platform detection
│   ├── fastsaver.ts            # FastSaver API wrapper (primary)
│   ├── aioapi.ts               # AIOAPI wrapper (fallback)
│   └── cache.ts                # Simple in-memory cache
├── .env.example                # Template – copy to .env.local
├── netlify.toml                # Netlify deployment config
└── next.config.ts              # Image remote patterns
```

---

## 🚀 Run Locally

### 1. Prerequisites

- Node.js ≥ 18
- npm (or pnpm / yarn)

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API keys:

```env
FASTSAVER_API_KEY=your_key_here
AIOAPI_KEY=your_rapid_api_key_here
```

> **Where to get keys**
> - **FastSaverAPI** → https://fastsaverapi.com or search "FastSaver" on [RapidAPI](https://rapidapi.com)
> - **AIOAPI** → https://rapidapi.com/search/aioapi (subscribe to a plan, copy your `x-rapidapi-key`)

### 4. Start the dev server

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🌐 Deploy on Netlify

### Option A – Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init          # link to a new/existing site
netlify deploy --prod
```

### Option B – Netlify Dashboard (Git-based)

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Go to **https://app.netlify.com → Add new site → Import an existing project**.
3. Select your repo.
4. Build settings are auto-detected from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Go to **Site settings → Environment variables** and add:
   - `FASTSAVER_API_KEY`
   - `AIOAPI_KEY`
6. Click **Deploy site**.

The `@netlify/plugin-nextjs` plugin (declared in `netlify.toml`) automatically wraps each API route as a Netlify serverless function — no extra config needed.

---

## ⚙️ API Reference

### `POST /api/download`

**Request body**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp4"
}
```

| Field    | Type   | Required | Description                                      |
|----------|--------|----------|--------------------------------------------------|
| `url`    | string | ✓        | Full video page URL (must start with https://)   |
| `format` | string | ✓        | `mp4` \| `mp3` \| `webm` \| `any`               |

**Success response**
```json
{
  "success": true,
  "source": "fastsaver",
  "title": "My Video Title",
  "thumbnail": "https://...",
  "downloadLinks": [
    { "quality": "1080p", "format": "mp4", "url": "https://...", "size": "120 MB" },
    { "quality": "720p",  "format": "mp4", "url": "https://..." }
  ]
}
```

**Error response**
```json
{
  "success": false,
  "error": "Both download APIs failed. Please try again later."
}
```

---

## 🔁 Fallback Logic

```
Request received
      │
      ▼
[FastSaver] ──── success? ──→ return result (cached)
      │ fail
      ▼
  retry once
      │ fail
      ▼
[AIOAPI]   ──── success? ──→ return result (cached)
      │ fail
      ▼
  retry once
      │ fail
      ▼
  502 error with message
```

---

## 📝 Notes

- **No filesystem usage** – the app never writes files; downloads are direct links to the video CDN.
- **No long-running processes** – ideal for serverless.
- **Copyright** – This tool is for personal, lawful use only. Always respect the terms of service of the source platform and copyright law.
"# Video-Downloader" 
