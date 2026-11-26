import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // /pdf/<project>/<dataset>/<file>.pdf  ->  Sanity CDN (same-origin proxy, Range requests pass through)
  async rewrites() {
    return [
      {
        source: "/pdf/:project/:dataset/:file",
        destination: "https://cdn.sanity.io/files/:project/:dataset/:file",
      },
    ];
  },

  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/pdfjs/:path*", headers: immutable },
      // Range (206) responses must not be cached at the edge: the cache key ignores
      // the Range header and would replay one slice for every range request.
      // Sanity's own CDN still caches the file, so this stays fast.
      {
        source: "/pdf/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
