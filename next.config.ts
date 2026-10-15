import type { NextConfig } from "next";

// Static export: the whole site builds to plain HTML in /out, so it can be
// hosted free on Vercel, Cloudflare Pages, Netlify, or GitHub Pages.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
