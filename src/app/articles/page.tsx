import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import ArticlesViewer from "@/components/articles/ArticlesViewer";
import { sanityFetch } from "@/lib/live";
import { ARTICLES_QUERY } from "@/lib/sanity";
import type { ArticleItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "المقالات | أ.د. رشا محمد أشرف",
};

export default async function ArticlesPage() {
  const { data: list } = await sanityFetch({ query: ARTICLES_QUERY });

  // The title keeps its stega characters (click-to-edit); the URL must be clean to be fetched.
  const articles = ((list ?? []) as unknown as ArticleItem[]).map((a) => ({
    ...a,
    pdfUrl: stegaClean(a.pdfUrl),
  }));

  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8">
      <ArticlesViewer articles={articles} />
    </main>
  );
}
