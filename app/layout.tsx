import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DOD's Secret Santa",
    template: "%s · DOD&apos;s  Secret Santa",
  },
  description:
    "A lightweight Secret Santa companion for sharing wishlists.",
  applicationName: "DOD&apos;s Secret Santa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOD's Secret Santa",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-900 text-gray-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
