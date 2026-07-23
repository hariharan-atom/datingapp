import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Atom — Meet with intention",
    short_name: "The Atom",
    description: "A thoughtful dating experience for India.",
    start_url: "/home",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
