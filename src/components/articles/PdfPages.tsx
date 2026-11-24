"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Uses the SAME pdf.js build as the original HTML page (3.11.174, UMD), loaded with a
 * plain <script> tag (cdnjs first, optional local copy second). Nothing from pdfjs-dist goes through the bundler,
 * so there is no "canvas" error and no version differences.
 */
type Viewport = { width: number; height: number };
type RenderTask = { promise: Promise<void>; cancel(): void };
type PdfPage = {
  getViewport(o: { scale: number }): Viewport;
  render(o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: Viewport;
  }): RenderTask;
};
type PdfDoc = { numPages: number; getPage(n: number): Promise<PdfPage> };
type LoadingTask = { promise: Promise<PdfDoc>; destroy(): Promise<void> };
type PdfJsLib = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(src: { data: ArrayBuffer }): LoadingTask;
};
declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

// Same version and source the original HTML page used (it worked there).
const VERSION = "3.11.174";
const SOURCES = [
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION}/`,
  "/pdfjs/", // optional local fallback: put pdf.min.js + pdf.worker.min.js in public/pdfjs
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      s.remove();
      reject(new Error("Could not load " + src));
    };
    document.head.appendChild(s);
  });
}

let libPromise: Promise<PdfJsLib> | null = null;
function loadPdfJs(): Promise<PdfJsLib> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!libPromise) {
    libPromise = (async () => {
      let lastError: unknown;
      for (const base of SOURCES) {
        try {
          await loadScript(base + "pdf.min.js");
          if (!window.pdfjsLib)
            throw new Error("pdfjsLib not found after loading " + base);
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            base + "pdf.worker.min.js";
          return window.pdfjsLib;
        } catch (e) {
          lastError = e;
        }
      }
      throw lastError;
    })().catch((e) => {
      libPromise = null;
      throw e;
    });
  }
  return libPromise;
}

type ErrorKind = "lib" | "notfound" | "forbidden" | "network" | "parse";

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

export default function PdfPages({ url }: { url: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState<ErrorKind | null>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<"page" | "width">("page");

  // 1. Load the PDF document
  useEffect(() => {
    let cancelled = false;
    let loadingTask: LoadingTask | null = null;

    (async () => {
      let lib: PdfJsLib;
      try {
        lib = await loadPdfJs();
      } catch (e) {
        console.error("pdf.js load failed:", e);
        if (!cancelled) setError("lib");
        return;
      }

      let buffer: ArrayBuffer;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled)
            setError(
              res.status === 404
                ? "notfound"
                : res.status === 403
                  ? "forbidden"
                  : "network",
            );
          return;
        }
        buffer = await res.arrayBuffer();
      } catch {
        if (!cancelled) setError("network");
        return;
      }
      if (cancelled) return;

      try {
        loadingTask = lib.getDocument({ data: buffer });
        const loaded = await loadingTask.promise;
        if (cancelled) return; // cleanup already destroyed the task
        setDoc(loaded);
      } catch (e) {
        console.error("pdf.js parse failed:", e);
        if (!cancelled) setError("parse");
      }
    })();

    return () => {
      cancelled = true;
      Promise.resolve(loadingTask?.destroy?.()).catch(() => {});
    };
  }, [url]);

  // 2. Track the available width (debounced, so resizing doesn't re-render every frame)
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

  // 3. Draw every page onto its own canvas
  useEffect(() => {
    const stage = stageRef.current;
    if (!doc || !stage || !width) return;

    let cancelled = false;
    let task: RenderTask | null = null;
    // Tallest a page may be in "fit page" mode: roughly what fits on screen under the navbar
    const maxHeight = Math.max(320, window.innerHeight - 140);
    // Always render at least 2x and let the browser scale down: much sharper text, even on 1x screens
    const oversample = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    stage.replaceChildren();

    (async () => {
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        // Different PDFs have different page shapes (16:9 slides vs. portrait A4), so
        // normalise: fit the whole page on screen, or fill the width.
        const widthScale = width / base.width;
        const fitScale =
          fit === "page"
            ? Math.min(widthScale, maxHeight / base.height)
            : widthScale;
        const cssScale = fitScale * zoom;
        const cssWidth = Math.floor(base.width * cssScale);
        const cssHeight = Math.floor(base.height * cssScale);
        // keep the backing canvas under ~4096px wide (mobile memory limits)
        const ratio = Math.max(1, Math.min(oversample, 4096 / cssWidth));
        const viewport = page.getViewport({ scale: cssScale * ratio });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        // Canvas text inherits typography from the page's CSS; pdf.js positions every glyph
        // itself, so any inherited spacing/direction breaks Arabic joining. Reset them.
        canvas.dir = "ltr";
        canvas.style.direction = "ltr";
        canvas.style.letterSpacing = "normal";
        canvas.style.wordSpacing = "normal";
        canvas.style.fontKerning = "auto";
        canvas.style.textRendering = "auto";
        canvas.className =
          "mx-auto mb-5 block rounded-md border border-line bg-white shadow-[0_6px_22px_rgba(13,42,92,0.12)]";
        stage.appendChild(canvas);

        task = page.render({
          canvasContext: canvas.getContext("2d")!,
          viewport,
        });
        await task.promise;
      }
    })().catch(() => {
      /* cancelled renders reject on purpose */
    });

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, width, zoom, fit]);

  const loading = !doc && !error;

  return (
    <>
      {loading && (
        <div
          className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted"
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
      {doc && (
        <div
          className="mb-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="تكبير المقال"
        >
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))
            }
            disabled={zoom <= 0.75}
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
            onClick={() =>
              setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))
            }
            disabled={zoom >= 2.5}
            aria-label="تكبير"
            className={zoomBtn}
          >
            +
          </button>
        </div>
      )}
      <div
        ref={stageRef}
        dir="ltr"
        className="min-h-[200px] overflow-x-auto"
        aria-live="polite"
      />
    </>
  );
}
