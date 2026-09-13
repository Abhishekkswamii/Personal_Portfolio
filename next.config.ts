import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,

  // A fully static site: no server to run the image optimiser, revalidate
  // ISR pages, or execute middleware/server actions. Firebase Hosting serves
  // the `out/` directory as-is; security/cache headers live in firebase.json
  // instead of next.config's headers() (unsupported with a static export).
  output: "export",

  images: {
    // The images are already pre-compressed WebP served as static files —
    // there is no server-side optimiser to resize/re-encode them at request
    // time, so this just serves the source file directly.
    unoptimized: true,
  },
};

export default nextConfig;
