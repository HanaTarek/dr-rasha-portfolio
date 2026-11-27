"use client";

import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import { KIND_META, type ResearchKind, type ResearchMenuItem } from "@/lib/research";

export default function ResearchSideMenu({
  items,
  currentSlug,
  kind,
}: {
  items: ResearchMenuItem[];
  currentSlug: string;
  kind: ResearchKind;
}) {
  const [open, setOpen] = useState(false);
  const current = Math.max(
    0,
    items.findIndex((r) => r.slug === currentSlug),
  );
  const title = KIND_META[kind].title;

  return (
    <SideMenu
      internal
      items={items.map((r) => ({
        id: r._id,
        label: r.title,
        href: `/research/${r.kind}/${r.slug}`,
      }))}
      current={current}
      title={title}
      toggleLabel={title}
      navLabel={title}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      onItemClick={() => setOpen(false)}
    />
  );
}
