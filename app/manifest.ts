import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Milo — Meet with intention",
    short_name: "Milo",
    description: "A thoughtful dating experience for India.",
    start_url: "/home",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FF4D6D",
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
