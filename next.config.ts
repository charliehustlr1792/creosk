import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ngrok-free.dev" },
      { protocol: "https", hostname: "**.ngrok-free.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.huggingface.co" },
      { protocol: "https", hostname: "**.hf.space" },
      { protocol: "https", hostname: "huggingface.co" },
    ],
  },
}

export default nextConfig