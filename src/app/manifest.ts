import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oriel",
    short_name: "Oriel",
    description: "Agents that meet on your terms.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F5F0",
    theme_color: "#534AB7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
