import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import ArticlesSideMenu from "@/components/articles/ArticlesSideMenu";
import PdfPages from "@/components/articles/PdfPages";
import { sanityFetch } from "@/lib/live";
import {
  ARTICLE_PAGE_QUERY,
  ARTICLE_TITLE_QUERY,
  type ArticleDetails,
  type ArticleMenuItem,
} from "@/lib/articles";
import { localPdfUrl } from "@/lib/pdf";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: ARTICLE_TITLE_QUERY,
    params: { slug },
  });
  const title = (data as { title?: string } | null)?.title;
  return {
    title: title
      ? `${stegaClean(title)} | أ.د. رشا محمد أشرف`
      : "المقالات | أ.د. رشا محمد أشرف",
  };
}

const navBtn =
  "inline-flex items-center rounded-full border border-teal px-5 py-2.5 text-[15px] font-bold text-teal no-underline hover:bg-teal hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: ARTICLE_PAGE_QUERY,
    params: { slug },
  });

  const { article, all } = (data ?? {}) as {
    article?: ArticleDetails | null;
    all?: ArticleMenuItem[];
  };
  if (!article?.pdfUrl) notFound();

  const menu = (all ?? []).map((a) => ({ ...a, slug: stegaClean(a.slug) }));
  const currentSlug = stegaClean(article.slug);
  const i = menu.findIndex((a) => a.slug === currentSlug);
  const prev = i > 0 ? menu[i - 1] : null;
  const next = i >= 0 && i < menu.length - 1 ? menu[i + 1] : null;
  const pdfUrl = localPdfUrl(stegaClean(article.pdfUrl));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8">
      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <ArticlesSideMenu articles={menu} currentSlug={currentSlug} />

        <article className="min-h-[85svh] w-full min-w-0">
          <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
            {article.title}
          </h1>
          <p className="mb-[18px] text-[15px] text-muted">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal"
            >
              فتح المقال بصيغة PDF في صفحة مستقلة
            </a>
          </p>

          <PdfPages key={article._id} url={pdfUrl} />

          {(prev || next) && (
            <nav
              aria-label="التنقل بين المقالات"
              className="mt-6 flex justify-between gap-3"
            >
              {prev ? (
                <Link href={`/articles/${prev.slug}`} className={navBtn}>
                  المقال السابق →
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/articles/${next.slug}`} className={navBtn}>
                  ← المقال التالي
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
      </div>
    </main>
  );
}
