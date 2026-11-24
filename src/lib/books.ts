import { stegaClean } from "next-sanity";
import type { SanityImage } from "./types";

export type Publisher = {
  name: string;
  website?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  note?: string;
};

export type BookMenuItem = { _id: string; title: string; slug: string };

export type BookListItem = BookMenuItem & {
  authors?: string[];
  cover?: SanityImage;
};

export type BookDetails = BookListItem & {
  edition?: string;
  year?: string;
  totalPages?: number;
  description?: string;
  chapters?: string[];
  summaryPdfUrl?: string;
  publisher?: Publisher;
};

const ORDER = `order(order asc, _createdAt asc)`;

export const BOOKS_LIST_QUERY = `*[_type == "book" && defined(slug.current)] | ${ORDER}{ _id, title, "slug": slug.current, authors, cover }`;

export const BOOK_TITLE_QUERY = `*[_type == "book" && slug.current == $slug][0]{ title }`;

// One request: the selected book + every book (for the side menu)
export const BOOK_PAGE_QUERY = `{
  "book": *[_type == "book" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, authors, edition, year, totalPages,
    description, chapters, cover,
    "summaryPdfUrl": summaryPdf.asset->url,
    publisher{ name, website, phone, whatsapp, address, note }
  },
  "all": *[_type == "book" && defined(slug.current)] | ${ORDER}{ _id, title, "slug": slug.current }
}`;

// Values used in URLs / hrefs must not carry stega (click-to-edit) characters.
export const clean = (v?: string) => (v ? stegaClean(v) : undefined);

export function cleanPublisher(p?: Publisher | null): Publisher | null {
  if (!p?.name) return null;
  return {
    ...p,
    website: clean(p.website),
    phone: clean(p.phone),
    whatsapp: clean(p.whatsapp),
  };
}
