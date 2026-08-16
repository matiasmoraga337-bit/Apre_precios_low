import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0b0d12",
    description: "Radar de ofertas historicas de videojuegos digitales para Chile.",
    display: "standalone",
    icons: [{ sizes: "any", src: "/icon.svg", type: "image/svg+xml" }],
    name: "Apre precios low",
    short_name: "Apre",
    start_url: "/",
    theme_color: "#0b0d12",
  };
}
