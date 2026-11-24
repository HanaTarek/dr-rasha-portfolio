"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleItem } from "@/lib/types";
import SideMenu from "@/components/SideMenu";
import PdfPages from "./PdfPages";

const DESKTOP = "(min-width: 1024px)";

function indexFromHash(length: number) {
  const m = /^#a(\d+)$/.exec(window.location.hash);
  const i = m ? Number(m[1]) - 1 : 0;
  return i >= 0 && i < length ? i : 0;
}

export default function ArticlesViewer({
  articles,
}: {
  articles: ArticleItem[];
}) {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

  // The selected article lives in the URL hash (#a1, #a2, ...) so it can be linked to.
  useEffect(() => {
    const sync = () => {
      setCurrent(indexFromHash(articles.length));
      setMenuOpen(false);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <p className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted">
        لا توجد مقالات بعد.
      </p>
    );
  }

  const article = articles[current];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
      <SideMenu
        items={articles.map((a, i) => ({
          id: a._id,
          label: a.title,
          href: `#a${i + 1}`,
        }))}
        current={current}
        title="المقالات"
        toggleLabel="قائمة المقالات"
        navLabel="قائمة المقالات"
        open={menuOpen}
        onToggle={() => setMenuOpen((o) => !o)}
        onItemClick={() => {
          if (!window.matchMedia(DESKTOP).matches) {
            viewerRef.current?.scrollIntoView();
          }
        }}
      />

      <article ref={viewerRef} className="min-w-0 scroll-mt-24">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          {article.title}
        </h1>
        <p className="mb-[18px] text-[15px] text-muted">
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-teal"
          >
            فتح المقال بصيغة PDF في صفحة مستقلة
          </a>
        </p>
        <PdfPages key={article._id} url={article.pdfUrl} />
      </article>
    </div>
  );
}
