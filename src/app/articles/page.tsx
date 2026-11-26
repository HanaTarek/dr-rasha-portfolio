import { redirect } from "next/navigation";
import { stegaClean } from "next-sanity";
import { sanityFetch } from "@/lib/live";
import { FIRST_ARTICLE_QUERY } from "@/lib/articles";

export default async function ArticlesIndex() {
  const { data } = await sanityFetch({ query: FIRST_ARTICLE_QUERY });
  const slug = (data as { slug?: string } | null)?.slug;
  if (slug) redirect(`/articles/${stegaClean(slug)}`);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8">
      <p className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted">
        لا توجد مقالات بعد.
      </p>
    </main>
  );
}
