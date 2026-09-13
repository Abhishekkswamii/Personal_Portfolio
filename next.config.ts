import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,

  images: {
    // Uploads are served same-origin from /uploads/[...path], so no
    // remotePatterns are needed — and none are allowed, which keeps the
    // optimiser from being pointed at arbitrary hosts.
    formats: ["image/avif", "image/webp"],
  },

  // sharp runs on the server only; keeping it external stops the bundler from
  // trying to trace its native binaries into the client graph.
  serverExternalPackages: ["sharp"],

  async headers() {
    return [
      {
        // The admin must never be indexed, cached by a proxy, or framed.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
