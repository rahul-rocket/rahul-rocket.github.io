export default function manifest() {
  return {
    name: "Rahul - Software Developer",
    short_name: "Rahul Dev",
    description: "Professional Software Developer based in Ahmedabad, India. Specializing in React, Next.js, Node.js, and modern web technologies.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["portfolio", "developer", "technology"],
    lang: "en",
    dir: "ltr",
  }
}
