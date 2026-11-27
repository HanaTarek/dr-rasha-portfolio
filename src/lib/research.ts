// src/lib/research.ts
// Pure module (no server-only imports) so client components can use it too.

export type ResearchKind = "supervised" | "discussed";
export type ResearchFilter = ResearchKind | "all";
export type Degree = "master" | "phd";

export const isKind = (v: unknown): v is ResearchKind =>
  v === "supervised" || v === "discussed";
export const isFilter = (v: unknown): v is ResearchFilter =>
  v === "all" || isKind(v);
export const isDegree = (v: unknown): v is Degree =>
  v === "master" || v === "phd";

export type ResearchMenuItem = {
  _id: string;
  title: string;
  slug: string;
  kind: ResearchKind;
};

export type ResearchListItem = ResearchMenuItem & {
  degree?: Degree;
  researcher?: string;
  year?: number;
  keywords?: string[];
};

export type ResearchDetails = ResearchListItem & {
  institution?: string;
  abstract?: string;
  pdfUrl?: string;
};

/** What GROQ returns before cleaning: enum fields are plain (possibly stega-encoded) strings */
export type Raw<T> = Omit<T, "kind" | "degree"> & {
  kind?: string | null;
  degree?: string | null;
};

export const DEGREE_LABEL: Record<Degree, string> = {
  master: "ماجستير",
  phd: "دكتوراه",
};

export const KIND_META: Record<
  ResearchKind,
  {
    /** short label (filter tab, badges in the list) */
    label: string;
    /** page title / hub card title */
    title: string;
    /** badge on a single research page */
    badge: string;
    /** hub card text */
    description: string;
    /** intro under the list page title */
    intro: string;
  }
> = {
  supervised: {
    label: "إشراف",
    title: "الرسائل التي تم الإشراف عليها",
    badge: "رسالة تم الإشراف عليها",
    description:
      "رسائل الماجستير والدكتوراه التي أشرفتُ عليها، مع نصوصها الكاملة.",
    intro:
      "رسائل الماجستير والدكتوراه التي أشرفتُ عليها. افتح أي رسالة لقراءة نصها الكامل.",
  },
  discussed: {
    label: "مناقشة",
    title: "الرسائل التي تمت مناقشتها",
    badge: "رسالة تمت مناقشتها",
    description:
      "رسائل الماجستير والدكتوراه التي شاركتُ في لجنة مناقشتها، مع نصوصها الكاملة.",
    intro:
      "رسائل الماجستير والدكتوراه التي شاركتُ في لجنة مناقشتها. افتح أي رسالة لقراءة نصها الكامل.",
  },
};

export const FILTERS: {
  value: ResearchFilter;
  label: string;
  title: string;
  intro: string;
}[] = [
  {
    value: "all",
    label: "الكل",
    title: "كل الرسائل العلمية",
    intro:
      "رسائل الماجستير والدكتوراه التي أشرفتُ عليها أو شاركتُ في مناقشتها. افتح أي رسالة لقراءة نصها الكامل.",
  },
  {
    value: "supervised",
    label: KIND_META.supervised.label,
    title: KIND_META.supervised.title,
    intro: KIND_META.supervised.intro,
  },
  {
    value: "discussed",
    label: KIND_META.discussed.label,
    title: KIND_META.discussed.title,
    intro: KIND_META.discussed.intro,
  },
];

/** Arabic plural forms: رسالة واحدة / رسالتان / 3-10 رسائل / 11+ رسالة */
export function countLabel(n: number) {
  if (n === 0) return "لا توجد رسائل بعد";
  if (n === 1) return "رسالة واحدة";
  if (n === 2) return "رسالتان";
  if (n <= 10) return `${n} رسائل`;
  return `${n} رسالة`;
}

/** For search: ignores diacritics, hamza forms, ى/ي, ة/ه and invisible stega characters. */
export const normalizeAr = (s: string) =>
  s
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .trim();

/* ---------------- GROQ ---------------- */

const ORDER = `order(order asc, year desc, _createdAt asc)`;
const LISTED = `_type == "research" && defined(slug.current) && defined(pdf.asset) && defined(kind)`;
const MENU = `_id, title, "slug": slug.current, kind`;

// Hub: just two counts
export const RESEARCH_HUB_QUERY = `{
  "supervised": count(*[${LISTED} && kind == "supervised"]),
  "discussed": count(*[${LISTED} && kind == "discussed"])
}`;

// List pages: everything once; the page filters by kind and the client searches it
export const RESEARCH_LIST_QUERY = `*[${LISTED}] | ${ORDER}{ ${MENU}, degree, researcher, year, keywords }`;

export const RESEARCH_TITLE_QUERY = `*[_type == "research" && slug.current == $slug][0]{ title }`;

// One request: the selected research + every research of the same kind (for the side menu)
export const RESEARCH_PAGE_QUERY = `{
  "paper": *[_type == "research" && slug.current == $slug][0]{
    ${MENU}, degree, researcher, year, institution, abstract, keywords,
    "pdfUrl": pdf.asset->url
  },
  "all": *[${LISTED} && kind == $kind] | ${ORDER}{ ${MENU} }
}`;
