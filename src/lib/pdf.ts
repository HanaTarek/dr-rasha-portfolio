// src/lib/pdf.ts
//
// Sanity PDFs are served through OUR origin (see `rewrites` in next.config.ts).
// Why: pdf.js decides whether it may use Range requests by reading the `Accept-Ranges`
// and `Content-Length` response headers. Cross-origin, the browser hides `Accept-Ranges`
// unless the CDN exposes it via CORS, and then pdf.js silently downloads the WHOLE file.
// Same-origin, the headers are always readable, so progressive loading is deterministic.
const SANITY_FILE =
  /^https:\/\/cdn\.sanity\.io\/files\/([^/]+)\/([^/]+)\/([^/?#]+)/;

export const localPdfUrl = (url: string) => {
  const m = SANITY_FILE.exec(url);
  return m ? `/pdf/${m[1]}/${m[2]}/${m[3]}` : url;
};
