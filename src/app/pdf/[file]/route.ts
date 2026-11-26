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
    // Whole file: safe to cache forever (the name is a content hash).
    // Partial (206): never let a shared cache store it, or it could be served for a different range.
    "cache-control":
      up.status === 206
        ? "private, no-store"
        : "public, max-age=31536000, immutable",
  });
  for (const k of ["content-length", "content-range", "etag"]) {
    const v = up.headers.get(k);
    if (v) headers.set(k, v);
  }

  return new Response(up.body, { status: up.status, headers });
}
