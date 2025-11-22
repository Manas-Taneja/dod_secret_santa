import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DOD's Secret Santa",
    short_name: "Secret Santa",
    description: "A lightweight Secret Santa companion for sharing wishlists.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111827",
    theme_color: "#111827",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

