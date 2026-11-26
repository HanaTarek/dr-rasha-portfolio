"use client";

import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import type { ArticleMenuItem } from "@/lib/articles";

export default function ArticlesSideMenu({
  articles,
  currentSlug,
}: {
  articles: ArticleMenuItem[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const current = Math.max(
    0,
    articles.findIndex((a) => a.slug === currentSlug),
  );

  return (
    <SideMenu
      items={articles.map((a) => ({
        id: a._id,
        label: a.title,
        href: `/articles/${a.slug}`,
      }))}
      current={current}
      title="المقالات"
      toggleLabel="قائمة المقالات"
      navLabel="قائمة المقالات"
      open={open}
      onToggle={() => setOpen((o) => !o)}
      internal
    />
  );
}
