"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Progressive PDF viewer.
 *
 *  - pdf.js loads the file through OUR OWN range loader (PDFDataRangeTransport): only the
 *    byte ranges the visible pages need are fetched, each with its own cache key
 *    (?rng=begin-end) and verified against the response's Content-Range header.
 *    This protects against CDNs/proxies that cache one 206 response and replay it
 *    for every other range (which makes pdf.js fail with "Invalid PDF structure").
 *  - One placeholder per page is created right away (no layout shift); each page is drawn
 *    as soon as its bytes arrive, one at a time, only when it is near the viewport.
 *  - Pages far from the viewport are released again, so memory stays flat on big PDFs.
 *  - If range loading is impossible, the file is downloaded normally as a last resort.
 *
 * pdf.js 3.11.174 (UMD), self-hosted in public/pdfjs/3.11.174/ :
 *   pdf.min.js + pdf.worker.min.js  (copy them from node_modules/pdfjs-dist/build/)
 */
type Viewport = { width: number; height: number };
type RenderTask = { promise: Promise<void>; cancel(): void };
type PdfPage = {
  getViewport(o: { scale: number }): Viewport;
  render(o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: Viewport;
  }): RenderTask;
  cleanup(): void;
};
type PdfDoc = { numPages: number; getPage(n: number): Promise<PdfPage> };
type LoadingTask = { promise: Promise<PdfDoc>; destroy(): Promise<void> };
type RangeTransport = {
  requestDataRange: (begin: number, end: number) => void;
  onDataRange(begin: number, chunk: Uint8Array): void;
};
type PdfJsLib = {
  GlobalWorkerOptions: { workerSrc: string };
  PDFWorker: new (o?: { name?: string }) => unknown;
  PDFDataRangeTransport: new (
    length: number,
    initialData: Uint8Array | null,
  ) => RangeTransport;
  getDocument(src: {
    url?: string;
    range?: RangeTransport;
    length?: number;
    initialData?: Uint8Array;
    worker?: unknown;
    disableAutoFetch?: boolean;
    disableStream?: boolean;
    disableRange?: boolean;
    isEvalSupported?: boolean;
    rangeChunkSize?: number;
  }): LoadingTask;
};
declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

const BASE = "/pdfjs/3.11.174/";
const CHUNK = 262144;

type Runtime = { lib: PdfJsLib; worker: unknown };
let runtimePromise: Promise<Runtime> | null = null;

// Loaded once, only when a PDF is actually opened. ONE worker is shared by every document.
function loadPdfJs(): Promise<Runtime> {
  if (!runtimePromise) {
    runtimePromise = new Promise<PdfJsLib>((resolve, reject) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      const s = document.createElement("script");
      s.src = BASE + "pdf.min.js";
      s.async = true;
      s.onload = () =>
        window.pdfjsLib
          ? resolve(window.pdfjsLib)
          : reject(new Error("pdfjsLib not found"));
      s.onerror = () => {
        s.remove();
        reject(new Error("Could not load pdf.js"));
      };
      document.head.appendChild(s);
    })
      .then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = BASE + "pdf.worker.min.js";
        return { lib, worker: new lib.PDFWorker({ name: "pdf-viewer" }) };
      })
      .catch((e) => {
        runtimePromise = null;
        throw e;
      });
  }
  return runtimePromise;
}

/* ---------- range loading (cache-safe) ---------- */

class RangeProblem extends Error {}

const withParam = (url: string, key: string, value: string) =>
  `${url}${url.includes("?") ? "&" : "?"}${key}=${value}`;

/**
 * Fetches bytes [begin, end] (inclusive). Every range has its own URL, so a cache that
 * ignores the Range header still stores them separately. The reply is verified: its
 * Content-Range must start at `begin`, otherwise the request is retried with a new key.
 */
async function fetchRange(
  url: string,
  begin: number,
  end: number,
  signal: AbortSignal,
): Promise<{ data: Uint8Array; total: number }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const key =
      attempt === 0
        ? `${begin}-${end}`
        : `${begin}-${end}-${attempt}-${Date.now()}`;
    const res = await fetch(withParam(url, "rng", key), {
      headers: { Range: `bytes=${begin}-${end}` },
      signal,
    });

    if (res.status === 404 || res.status === 403) {
      void res.body?.cancel();
      throw Object.assign(new Error(`HTTP ${res.status}`), {
        status: res.status,
      });
    }

    const m = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(
      res.headers.get("content-range") ?? "",
    );
    if (res.status === 206 && m && Number(m[1]) === begin) {
      const data = new Uint8Array(await res.arrayBuffer());
      if (data.length === Number(m[2]) - begin + 1) {
        return { data, total: m[3] === "*" ? 0 : Number(m[3]) };
      }
    } else {
      void res.body?.cancel(); // wrong slice or a full 200: don't download it
    }
  }
  throw new RangeProblem(`bad range response for bytes ${begin}-${end}`);
}

async function openRanged(
  rt: Runtime,
  url: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onTask: (t: LoadingTask) => void,
): Promise<PdfDoc> {
  const first = await fetchRange(url, 0, CHUNK - 1, signal);
  if (!first.total) throw new RangeProblem("unknown file size");
  const total = first.total;

  const transport = new rt.lib.PDFDataRangeTransport(total, first.data);
  transport.requestDataRange = (begin: number, end: number) => {
    // pdf.js passes an exclusive end
    const last = Math.min(end, total) - 1;
    fetchRange(url, begin, last, signal)
      .then(({ data }) => {
        if (!isCancelled()) transport.onDataRange(begin, data);
      })
      .catch((e) => {
        if (!signal.aborted) console.error("range request failed:", e);
      });
  };

  const task = rt.lib.getDocument({
    range: transport,
    length: total,
    initialData: first.data,
    worker: rt.worker,
    disableStream: true,
    disableAutoFetch: true, // never download the rest of the file in the background
    isEvalSupported: false,
    rangeChunkSize: CHUNK,
  });
  onTask(task);
  return task.promise;
}

type ErrorKind = "lib" | "notfound" | "forbidden" | "network" | "parse";

function classify(e: unknown): ErrorKind {
  const err = e as { name?: string; status?: number };
  if (err.name === "MissingPDFException" || err.status === 404)
    return "notfound";
  if (err.status === 403) return "forbidden";
  if (err.name === "InvalidPDFException" || err.name === "FormatError")
    return "parse";
  return "network";
}

const ERROR_TEXT: Record<ErrorKind, { title: string; hint: string }> = {
  lib: {
    title: "تعذّر تحميل مكتبة عرض الـ PDF.",
    hint: "تأكد من اتصالك بالإنترنت ثم أعد تحميل الصفحة.",
  },
  notfound: {
    title: "لم يتم العثور على الملف.",
    hint: "قد يكون الملف حُذف من Sanity. ارفع الملف مرة أخرى من لوحة التحرير.",
  },
  forbidden: {
    title: "تعذّر الوصول إلى الملف.",
    hint: "تأكد أن مجموعة البيانات (dataset) في Sanity عامة.",
  },
  network: {
    title: "تعذّر تحميل الملف.",
    hint: "تأكد من اتصالك بالإنترنت ثم أعد تحميل الصفحة.",
  },
  parse: {
    title: "تعذّر قراءة الملف.",
    hint: "تأكد أنه ملف PDF سليم، وجرّب تصديره مرة أخرى.",
  },
};

const RENDER_MARGIN = "800px 0px"; // start drawing a page this far before it is visible
const RELEASE_MARGIN = "2400px 0px"; // free a drawn page once it is this far away
const MAX_PIXELS = 12_000_000; // per canvas; phones (iOS) refuse much larger ones

const zoomBtn =
  "grid h-9 min-w-9 cursor-pointer place-items-center rounded-full border border-line bg-bg px-3 text-base font-bold text-ink hover:bg-surface aria-pressed:border-teal aria-pressed:text-teal disabled:cursor-default disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

export default function PdfPages({ url }: { url: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);

  // 1. Open the document. Only the first ranges are fetched here; pages come later.
  useEffect(() => {
    let cancelled = false;
    // the cast stops TypeScript from narrowing `task` to `null` (it is assigned in a callback)
    let task = null as LoadingTask | null;
    const abort = new AbortController();

    setError(null);

    (async () => {
      let rt: Runtime;
      try {
        rt = await loadPdfJs();
      } catch (e) {
        console.error("pdf.js load failed:", e);
        if (!cancelled) setError("lib");
        return;
      }
      if (cancelled) return;

      try {
        let loaded: PdfDoc;
        try {
          loaded = await openRanged(
            rt,
            url,
            abort.signal,
            () => cancelled,
            (t) => {
              task = t;
            },
          );
        } catch (e) {
          if (cancelled) return;
          // Only fall back when ranges themselves are unusable (not 404/403/offline).
          if (!(e instanceof RangeProblem) && classify(e) !== "parse") throw e;
          console.warn("Range loading failed, downloading the whole file:", e);
          await Promise.resolve(task?.destroy()).catch(() => {});
          if (cancelled) return;
          task = rt.lib.getDocument({
            url: withParam(url, "full", String(Date.now())),
            worker: rt.worker,
            disableRange: true, // plain GET, no Range header
            disableStream: false,
            disableAutoFetch: false,
            isEvalSupported: false,
          });
          loaded = await task.promise;
        }
        if (!cancelled) setDoc(loaded);
      } catch (e) {
        if (cancelled) return;
        console.error("pdf.js load failed:", e);
        setError(classify(e));
      }
    })();

    return () => {
      cancelled = true;
      abort.abort(); // stops in-flight range requests
      // the shared worker survives
      Promise.resolve(task?.destroy()).catch(() => {});
    };
  }, [url]);

  // 2. Track the available width (debounced)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () =>
      setWidth(Math.max(280, Math.floor(stage.clientWidth)));
    measure();
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 250);
    });
    observer.observe(stage);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 3. Placeholders for every page, drawn lazily, released when far away.
  //    slot.dataset.s: (unset) = empty, "queued" = waiting for its turn, "drawn" = canvas inside
  useEffect(() => {
    const stage = stageRef.current;
    if (!doc || !stage || !width) return;

    let cancelled = false;
    const active = new Set<RenderTask>();
    let nearObserver: IntersectionObserver | undefined;
    let farObserver: IntersectionObserver | undefined;
    let chain: Promise<void> = Promise.resolve();

    const maxHeight = Math.max(320, window.innerHeight - 140);
    const oversample = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);

    const sizeOf = (base: Viewport) => {
      const scale = (width / base.width) * zoom;
      return {
        scale,
        w: Math.floor(base.width * scale),
        h: Math.floor(base.height * scale),
      };
    };

    const renderInto = async (n: number, slot: HTMLElement) => {
      const page = await doc.getPage(n); // triggers the Range requests for this page
      if (cancelled || slot.dataset.s !== "queued") return;

      const { scale, w, h } = sizeOf(page.getViewport({ scale: 1 }));
      const ratio = Math.max(
        1,
        Math.min(oversample, Math.sqrt(MAX_PIXELS / (w * h))),
      );
      const viewport = page.getViewport({ scale: scale * ratio });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // pdf.js positions every glyph itself; inherited spacing/direction breaks Arabic joining.
      canvas.dir = "ltr";
      canvas.style.direction = "ltr";
      canvas.style.letterSpacing = "normal";
      canvas.style.wordSpacing = "normal";
      canvas.style.fontKerning = "auto";
      canvas.style.textRendering = "auto";
      canvas.className =
        "block rounded-md border border-line bg-white shadow-[0_6px_22px_rgba(13,42,92,0.12)]";

      // a page can differ in size from page 1: correct its placeholder
      slot.style.width = `${w}px`;
      slot.style.height = `${h}px`;
      slot.replaceChildren(canvas);
      slot.dataset.s = "drawn";

      const task = page.render({
        canvasContext: canvas.getContext("2d")!,
        viewport,
      });
      active.add(task);
      try {
        await task.promise;
      } finally {
        active.delete(task);
        page.cleanup();
      }
    };

    const release = (slot: HTMLElement) => {
      const canvas = slot.firstElementChild as HTMLCanvasElement | null;
      if (canvas) {
        canvas.width = 0; // frees the bitmap immediately
        canvas.height = 0;
      }
      slot.replaceChildren();
      delete slot.dataset.s;
    };

    (async () => {
      const first = await doc.getPage(1);
      if (cancelled) return;
      const { w, h } = sizeOf(first.getViewport({ scale: 1 }));

      // Old canvases stay on screen until this point, so the stage never collapses.
      stage.replaceChildren();

      nearObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const slot = entry.target as HTMLElement;
            if (slot.dataset.s) continue; // already queued or drawn
            slot.dataset.s = "queued";
            chain = chain
              .then(async () => {
                if (cancelled || slot.dataset.s !== "queued") return;
                await renderInto(Number(slot.dataset.page), slot);
                await yieldToMain(); // let taps/scroll through between pages
              })
              .catch((e) => {
                // cancelled renders reject on purpose; a failed page may retry later
                if (!cancelled && slot.dataset.s !== "drawn") {
                  console.error(`page ${slot.dataset.page} failed:`, e);
                }
                if (slot.dataset.s === "queued") delete slot.dataset.s;
              });
          }
        },
        { rootMargin: RENDER_MARGIN },
      );

      farObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const slot = entry.target as HTMLElement;
            if (!entry.isIntersecting && slot.dataset.s) release(slot);
          }
        },
        { rootMargin: RELEASE_MARGIN },
      );

      for (let n = 1; n <= doc.numPages; n++) {
        const slot = document.createElement("div");
        slot.dataset.page = String(n);
        slot.className = "mx-auto mb-5 rounded-md bg-surface";
        slot.style.width = `${w}px`;
        slot.style.height = `${h}px`;
        stage.appendChild(slot);
        nearObserver.observe(slot);
        farObserver.observe(slot);
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
      nearObserver?.disconnect();
      farObserver?.disconnect();
      active.forEach((t) => t.cancel());
    };
  }, [doc, width, zoom]);

  const loading = !doc && !error;

  return (
    // min-h reserves space while loading so the footer doesn't jump when pages appear
    <div className="min-h-[80svh]">
      <div
        className="mb-3 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="تكبير الملف"
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
          disabled={!doc || zoom <= 0.75}
          aria-label="تصغير"
          className={zoomBtn}
        >
          −
        </button>
        <span
          className="min-w-14 text-center text-[15px] font-bold text-ink"
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
          disabled={!doc || zoom >= 2.5}
          aria-label="تكبير"
          className={zoomBtn}
        >
          +
        </button>
      </div>

      {loading && (
        <div
          className="mb-3 rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted"
          role="status"
        >
          جارٍ التحميل…
        </div>
      )}
      {error && (
        <div
          className="rounded-lg border border-s-4 border-line border-s-gold bg-surface p-5 text-muted"
          role="alert"
        >
          <b className="text-ink">{ERROR_TEXT[error].title}</b>
          <br />
          {ERROR_TEXT[error].hint}
        </div>
      )}

      {/* no aria-live here: announcing every appended canvas is just noise */}
      <div ref={stageRef} dir="ltr" className="w-full overflow-x-auto" />
    </div>
  );
}
