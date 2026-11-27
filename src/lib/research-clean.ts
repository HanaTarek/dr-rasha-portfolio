// src/lib/research-clean.ts
// Server-side helpers. Values used for logic or URLs (kind, slug, degree) must not carry
// stega (click-to-edit) characters, so they are cleaned here once.
import { stegaClean } from "next-sanity";
import {
  isDegree,
  isKind,
  type Raw,
  type ResearchDetails,
  type ResearchListItem,
  type ResearchMenuItem,
} from "./research";

function clean<T extends ResearchMenuItem>(r: Raw<T>): T | null {
  const kind = stegaClean(r.kind ?? "");
  if (!isKind(kind)) return null;
  const degree = stegaClean(r.degree ?? "");
  return {
    ...r,
    slug: stegaClean(r.slug),
    kind,
    degree: isDegree(degree) ? degree : undefined,
  } as unknown as T;
}

export function cleanMenu(raw?: Raw<ResearchMenuItem>[] | null) {
  return (raw ?? [])
    .map((r) => clean<ResearchMenuItem>(r))
    .filter((r): r is ResearchMenuItem => r !== null);
}

export function cleanList(raw?: Raw<ResearchListItem>[] | null) {
  return (raw ?? [])
    .map((r) => clean<ResearchListItem>(r))
    .filter((r): r is ResearchListItem => r !== null);
}

export function cleanDetails(raw?: Raw<ResearchDetails> | null) {
  if (!raw) return null;
  const paper = clean<ResearchDetails>(raw);
  if (!paper) return null;
  return {
    ...paper,
    pdfUrl: paper.pdfUrl ? stegaClean(paper.pdfUrl) : undefined,
  };
}
