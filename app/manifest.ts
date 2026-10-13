import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Watch My Trip Package",
    short_name: "WatchMyTrip",
    description:
      "Your Journey, Our Responsibility - Book holiday tour packages across Goa, India & international destinations.",
    start_url: "/",
    display: "standalone",
    background_color: "#070B18",
    theme_color: "#FF5A3C",
    icons: [
      {
        src: "/favicon.png?v=4",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png?v=4",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
