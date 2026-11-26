"use client";

import { useEffect, useRef, useState } from "react";

/*
 * pdf.js 3.11.174 (UMD), self-hosted in public/pdfjs/3.11.174/ :
 *   pdf.min.js + pdf.worker.min.js  (copy them from node_modules/pdfjs-dist/build/)
 * Same origin => no cdnjs DNS/TLS cost, cacheable forever, no blob: worker wrapper.
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
type PdfJsLib = {
  GlobalWorkerOptions: { workerSrc: string };
  PDFWorker: new (o?: { name?: string }) => unknown;
  getDocument(src: {
    url: string;
    worker?: unknown;
    disableAutoFetch?: boolean;
    isEvalSupported?: boolean;
  }): LoadingTask;
};
declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

const BASE = "/pdfjs/3.11.174/";

type Runtime = { lib: PdfJsLib; worker: unknown };
let runtimePromise: Promise<Runtime> | null = null;

// Loaded once, only when a PDF is actually opened. ONE worker is shared by every article,
// so switching articles no longer spawns (and re-downloads) a new worker each time.
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
        return { lib, worker: new lib.PDFWorker({ name: "articles" }) };
      })
      .catch((e) => {
        runtimePromise = null;
        throw e;
      });
  }
  return runtimePromise;
}

type ErrorKind = "lib" | "notfound" | "forbidden" | "network" | "parse";

// pdf.js reports HTTP problems as exceptions when it loads by URL
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
    title: "لم يتم العثور على ملف المقال.",
    hint: "قد يكون الملف حُذف من Sanity. ارفع الملف مرة أخرى من لوحة التحرير.",
  },
  forbidden: {
    title: "تعذّر الوصول إلى ملف المقال.",
    hint: "تأكد أن مجموعة البيانات (dataset) في Sanity عامة.",
  },
  network: {
    title: "تعذّر تحميل ملف المقال.",
    hint: "تأكد من اتصالك بالإنترنت ثم أعد تحميل الصفحة.",
  },
  parse: {
    title: "تعذّر قراءة ملف المقال.",
    hint: "تأكد أنه ملف PDF سليم، وجرّب تصديره مرة أخرى من PowerPoint.",
  },
};

const zoomBtn =
  "grid h-9 min-w-9 cursor-pointer place-items-center rounded-full border border-line bg-bg px-3 text-base font-bold text-ink hover:bg-surface aria-pressed:border-teal aria-pressed:text-teal disabled:cursor-default disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

export default function PdfPages({ url }: { url: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);

  // 1. Load the PDF by URL (not fetch -> ArrayBuffer): pdf.js streams it and, when the
  //    server supports Range requests, downloads only the parts the visible pages need.
  useEffect(() => {
    let cancelled = false;
    let task: LoadingTask | null = null;

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
        task = rt.lib.getDocument({
          url,
          worker: rt.worker,
          disableAutoFetch: true, // don't pull the whole file in the background
          isEvalSupported: false, // hardening for pdf.js < 4.2 (CVE-2024-4367)
        });
        const loaded = await task.promise;
        if (!cancelled) setDoc(loaded);
      } catch (e) {
        if (cancelled) return;
        console.error("pdf.js load failed:", e);
        setError(classify(e));
      }
    })();

    return () => {
      cancelled = true;
      // destroy() also aborts the in-flight download
      Promise.resolve(task?.destroy?.()).catch(() => {});
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

  // 3. Create one correctly-sized placeholder per page immediately (no layout shift),
  //    then draw each page only when it is near the viewport, one at a time.
  useEffect(() => {
    const stage = stageRef.current;
    if (!doc || !stage || !width) return;

    let cancelled = false;
    const active = new Set<RenderTask>();
    let observer: IntersectionObserver | undefined;
    let chain: Promise<void> = Promise.resolve();

    const maxHeight = Math.max(320, window.innerHeight - 140);
    // sharp text without the memory cost of 3x canvases on phones
    const oversample = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);

    const sizeOf = (base: Viewport) => {
      const scale =
        Math.min(width / base.width, maxHeight / base.height) * zoom;
      return {
        scale,
        w: Math.floor(base.width * scale),
        h: Math.floor(base.height * scale),
      };
    };

    const renderInto = async (n: number, slot: HTMLElement) => {
      const page = await doc.getPage(n);
      if (cancelled) return;

      const { scale, w, h } = sizeOf(page.getViewport({ scale: 1 }));
      const ratio = Math.max(1, Math.min(oversample, 4096 / w));
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

      // if this page differs from page 1, correct the placeholder
      slot.style.width = `${w}px`;
      slot.style.height = `${h}px`;
      slot.replaceChildren(canvas);

      const task = page.render({
        canvasContext: canvas.getContext("2d")!,
        viewport,
      });
      active.add(task);
      try {
        await task.promise;
      } finally {
        active.delete(task);
      }
      page.cleanup();
    };

    (async () => {
      const first = await doc.getPage(1);
      if (cancelled) return;
      const { w, h } = sizeOf(first.getViewport({ scale: 1 }));

      // Old canvases stay on screen until this point, so the stage never collapses.
      stage.replaceChildren();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const slot = entry.target as HTMLElement;
            observer?.unobserve(slot);
            const n = Number(slot.dataset.page);
            chain = chain
              .then(async () => {
                if (cancelled) return;
                await renderInto(n, slot);
                await yieldToMain(); // let taps/scroll through between pages
              })
              .catch(() => {
                /* cancelled renders reject on purpose */
              });
          }
        },
        { rootMargin: "800px 0px" },
      );

      for (let n = 1; n <= doc.numPages; n++) {
        const slot = document.createElement("div");
        slot.dataset.page = String(n);
        slot.className = "mx-auto mb-5 rounded-md bg-surface";
        slot.style.width = `${w}px`;
        slot.style.height = `${h}px`;
        stage.appendChild(slot);
        observer.observe(slot);
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
      observer?.disconnect();
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
        aria-label="تكبير المقال"
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
          جارٍ تحميل المقال…
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
      <div ref={stageRef} dir="ltr" className="overflow-x-auto" />
    </div>
  );
}
