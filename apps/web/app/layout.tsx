import type { Metadata } from "next";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://go-beyond-adventure-travel.rathishk24.chatgpt.site"),
  title: "Dubai Hikers | Guided Mountain Hikes",
  description: "Book certified guided hiking events across the mountain trails of Ras Al Khaimah, UAE.",
  openGraph: {
    title: "Dubai Hikers | Find Higher Ground",
    description: "Small-group guided hikes across Ras Al Khaimah's most memorable mountain trails.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Hikers | Find Higher Ground",
    description: "Certified guided mountain hikes in Ras Al Khaimah.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
