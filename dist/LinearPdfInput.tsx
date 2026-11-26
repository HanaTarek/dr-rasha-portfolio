"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { set, unset, useClient, type FileInputProps } from "sanity";

/*
 * Custom input for Sanity "file" fields that hold PDFs.
 * The editor picks a PDF -> it is linearized ("Fast Web View") in the browser with
 * qpdf (WebAssembly) -> the optimized file is uploaded to Sanity. If optimizing fails
 * for any reason, the ORIGINAL file is uploaded instead, so the editor is never blocked.
 *
 * Needs:  npm i @neslinesli93/qpdf-wasm   and   public/qpdf.wasm
 * (Uses plain HTML elements instead of @sanity/ui, so there are no prop-type conflicts.)
 */

const MAX_MB = 30;

async function linearize(file: File): Promise<File> {
  // loaded only when a PDF is actually chosen (keeps the Studio bundle light)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("@neslinesli93/qpdf-wasm");
  const createModule = mod.default ?? mod;
  const qpdf = await createModule({ locateFile: () => "/qpdf.wasm" });

  qpdf.FS.writeFile("/in.pdf", new Uint8Array(await file.arrayBuffer()));

  try {
    // PowerPoint / Word exports often make qpdf print warnings. qpdf then exits with
    // code 3 even though it wrote a perfectly good file, and the wasm build may throw.
    // --warning-exit-0 avoids that; the try/catch covers builds that throw anyway.
    // The real judge is the validation below, not the exit code.
    qpdf.callMain(["--warning-exit-0", "--linearize", "/in.pdf", "/out.pdf"]);
  } catch (e) {
    console.warn("qpdf exited with an error, checking the output anyway:", e);
  }

  const out: Uint8Array = (qpdf.FS.readFile("/out.pdf") as Uint8Array).slice();

  // Never upload a damaged or non-linearized result: throw, and the caller
  // uploads the ORIGINAL file instead (and tells the editor).
  const problem = validate(out, file.size);
  if (problem) throw new Error(`Linearized output rejected: ${problem}`);

  return new File([out as BlobPart], file.name, { type: "application/pdf" });
}

function validate(out: Uint8Array, originalSize: number): string | null {
  if (out.length < 1024) return "output too small";
  if (out.length < originalSize * 0.7 || out.length > originalSize * 1.5)
    return `unexpected size (${out.length} vs ${originalSize})`;

  const latin1 = new TextDecoder("latin1");
  if (latin1.decode(out.subarray(0, 5)) !== "%PDF-")
    return "missing %PDF- header";
  // the linearization dictionary is the first object, so it sits at the very start
  if (!latin1.decode(out.subarray(0, 2048)).includes("/Linearized"))
    return "not linearized";
  if (!latin1.decode(out.subarray(out.length - 1024)).includes("%%EOF"))
    return "missing %%EOF";
  return null;
}

type Status = "idle" | "working" | "done" | "plain" | "error";

const box: CSSProperties = {
  border: "1px solid rgba(128,128,128,0.4)",
  borderRadius: 3,
  padding: 12,
  fontSize: 14,
};

const btn: CSSProperties = {
  border: "1px solid rgba(128,128,128,0.5)",
  borderRadius: 3,
  padding: "8px 14px",
  fontSize: 14,
  cursor: "pointer",
  background: "transparent",
  color: "inherit",
};

const COLORS: Record<Status, string> = {
  idle: "inherit",
  working: "#2276fc",
  done: "#30a46c",
  plain: "#f5a524",
  error: "#e5484d",
};

export default function LinearPdfInput(props: FileInputProps) {
  const { value, onChange, readOnly } = props;
  const client = useClient({ apiVersion: "2025-01-01" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setStatus("error");
        setMessage("الملف يجب أن يكون بصيغة PDF.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setStatus("error");
        setMessage(`حجم الملف أكبر من ${MAX_MB} ميجابايت.`);
        return;
      }

      setStatus("working");
      setMessage("جارٍ تجهيز الملف للعرض السريع…");

      let toUpload: File = file;
      let optimized = true;
      let reason = "";
      try {
        toUpload = await linearize(file);
      } catch (e) {
        console.error("PDF linearize failed, uploading the original:", e);
        optimized = false;
        reason = e instanceof Error ? e.message : String(e);
      }

      try {
        const asset = await client.assets.upload("file", toUpload, {
          filename: file.name,
          contentType: "application/pdf",
        });
        onChange(
          set({
            _type: "file",
            asset: { _type: "reference", _ref: asset._id },
          }),
        );
        setStatus(optimized ? "done" : "plain");
        setMessage(
          optimized
            ? "تم رفع الملف وتجهيزه للعرض السريع."
            : `تم رفع الملف، لكن تعذّر تجهيزه للعرض السريع (سيعمل لكن قد يتأخر ظهوره). السبب: ${reason}`,
        );
      } catch (e) {
        console.error("Upload failed:", e);
        setStatus("error");
        setMessage("تعذّر رفع الملف. حاول مرة أخرى.");
      }
    },
    [client, onChange],
  );

  const hasFile = Boolean(value?.asset?._ref);
  const busy = status === "working";

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          ...box,
          borderColor: hasFile ? "#30a46c" : "rgba(128,128,128,0.4)",
        }}
      >
        {hasFile ? "يوجد ملف مرفوع لهذا المقال." : "لم يتم رفع ملف بعد."}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={readOnly || busy}
          onClick={() => inputRef.current?.click()}
          style={{
            ...btn,
            background: "#2276fc",
            borderColor: "#2276fc",
            color: "#fff",
            opacity: readOnly || busy ? 0.6 : 1,
          }}
        >
          {busy
            ? "جارٍ المعالجة…"
            : hasFile
              ? "استبدال الملف"
              : "اختيار ملف PDF"}
        </button>

        {hasFile && (
          <button
            type="button"
            disabled={readOnly || busy}
            onClick={() => {
              onChange(unset());
              setStatus("idle");
              setMessage("");
            }}
            style={{ ...btn, color: "#e5484d", borderColor: "#e5484d" }}
          >
            إزالة الملف
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // allow choosing the same file again
          if (file) void handleFile(file);
        }}
      />

      {message && (
        <div
          role="status"
          style={{
            ...box,
            borderColor: COLORS[status],
            color: COLORS[status],
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
