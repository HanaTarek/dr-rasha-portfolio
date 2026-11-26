const UPSTREAM = "https://cdn.sanity.io/files/uc6805ie/production/";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  // Only Sanity file names (40-hex hash + .pdf), so this can't be used as an open proxy.
  if (!/^[a-f0-9]{40}\.pdf$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const range = req.headers.get("range");
  const up = await fetch(UPSTREAM + file, {
    headers: { "accept-encoding": "identity", ...(range ? { range } : {}) },
    cache: "no-store",
  });
  if (up.status !== 200 && up.status !== 206) {
    return new Response("Upstream error", { status: up.status });
  }

const headers = new Headers({
  "content-type": "application/pdf",
  "accept-ranges": "bytes",
  // "private": the CDN won't store it, so every Range request reaches this route.
  // The visitor's own browser still caches it (the file name is a content hash).
  "cache-control": "private, max-age=31536000, immutable",
});

    for (const k of ["content-length", "content-range", "etag"]) {
    const v = up.headers.get(k);
    if (v) headers.set(k, v);
    }

    // Range request: stream the slice as before (it already has a length).
    if (range) return new Response(up.body, { status: up.status, headers });

    // Full request: buffer it so Vercel sends Content-Length instead of chunked.
    // pdf.js only reads the headers, sees range support, then cancels this download.
    const buf = await up.arrayBuffer();
    headers.set("content-length", String(buf.byteLength));
    return new Response(buf, { status: 200, headers });

  return new Response(up.body, { status: up.status, headers });
}
