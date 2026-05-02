import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Universal Video Downloader",
  description:
    "Developped By Ayoub",
  keywords: ["video downloader", "youtube downloader", "instagram downloader", "tiktok downloader", "mp4", "mp3"],
  openGraph: {
    title: "Universal Video Downloader",
    description: "Download videos from any platform instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
