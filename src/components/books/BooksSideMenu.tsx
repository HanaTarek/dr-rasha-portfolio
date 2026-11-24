"use client";

import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import type { BookMenuItem } from "@/lib/books";

export default function BooksSideMenu({
  books,
  currentSlug,
}: {
  books: BookMenuItem[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const current = Math.max(
    0,
    books.findIndex((b) => b.slug === currentSlug),
  );

  return (
    <SideMenu
      internal
      items={books.map((b) => ({
        id: b._id,
        label: b.title,
        href: `/books/${b.slug}`,
      }))}
      current={current}
      title="الكتب"
      toggleLabel="قائمة الكتب"
      navLabel="قائمة الكتب"
      open={open}
      onToggle={() => setOpen((o) => !o)}
      onItemClick={() => setOpen(false)}
    />
  );
}
