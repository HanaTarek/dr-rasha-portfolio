export type ArticleMenuItem = { _id: string; title: string; slug: string };
export type ArticleDetails = ArticleMenuItem & { pdfUrl?: string };

const ORDER = `order(order asc, _createdAt asc)`;
const LISTED = `_type == "article" && defined(slug.current) && defined(pdf.asset)`;

export const ARTICLE_TITLE_QUERY = `*[_type == "article" && slug.current == $slug][0]{ title }`;

export const FIRST_ARTICLE_QUERY = `*[${LISTED}] | ${ORDER}[0]{ "slug": slug.current }`;

// One request: the selected article + every article (for the side menu)
export const ARTICLE_PAGE_QUERY = `{
  "article": *[_type == "article" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, "pdfUrl": pdf.asset->url
  },
  "all": *[${LISTED}] | ${ORDER}{ _id, title, "slug": slug.current }
}`;
