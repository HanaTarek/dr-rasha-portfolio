import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { stegaClean } from "next-sanity";
import PdfPages from "@/components/articles/PdfPages";
import KindIcon from "@/components/research/KindIcon";
import ResearchSideMenu from "@/components/research/ResearchSideMenu";
import { sanityFetch } from "@/lib/live";
import { localPdfUrl } from "@/lib/pdf";
import {
  DEGREE_LABEL,
  KIND_META,
  RESEARCH_PAGE_QUERY,
  RESEARCH_TITLE_QUERY,
  isKind,
  type Raw,
  type ResearchDetails,
  type ResearchMenuItem,
} from "@/lib/research";
import { cleanDetails, cleanMenu } from "@/lib/research-clean";

type Props = { params: Promise<{ kind: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: RESEARCH_TITLE_QUERY,
    params: { slug },
  });
  const title = (data as { title?: string } | null)?.title;
  return {
    title: title
      ? `${stegaClean(title)} | أ.د. رشا محمد أشرف`
      : "الرسائل العلمية | أ.د. رشا محمد أشرف",
  };
}

const h2 = "mb-3 text-[22px] font-extrabold text-ink";
const navBtn =
  "inline-flex items-center rounded-full border border-teal px-5 py-2.5 text-[15px] font-bold text-teal no-underline hover:bg-teal hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default async function ResearchDetailPage({ params }: Props) {
  const { kind, slug } = await params;
  if (!isKind(kind)) notFound();

  const { data } = await sanityFetch({
    query: RESEARCH_PAGE_QUERY,
    params: { slug, kind },
  });
  const { paper: rawPaper, all } = (data ?? {}) as {
    paper?: Raw<ResearchDetails> | null;
    all?: Raw<ResearchMenuItem>[];
  };

  const paper = cleanDetails(rawPaper);
  if (!paper || !paper.pdfUrl) notFound();
  // the URL said "supervised" but this paper is "discussed" (or the reverse): send to the real URL
  if (paper.kind !== kind) redirect(`/research/${paper.kind}/${paper.slug}`);

  const menu = cleanMenu(all);
  const i = menu.findIndex((r) => r.slug === paper.slug);
  const prev = i > 0 ? menu[i - 1] : null;
  const next = i >= 0 && i < menu.length - 1 ? menu[i + 1] : null;

  const meta = [
    paper.researcher && { label: "الباحث", value: paper.researcher },
    paper.degree && { label: "الدرجة", value: DEGREE_LABEL[paper.degree] },
    paper.year && { label: "السنة", value: String(paper.year) },
    paper.institution && { label: "الجهة", value: paper.institution },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8">
      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <ResearchSideMenu items={menu} currentSlug={paper.slug} kind={kind} />

        <article className="min-w-0">
          <p className="mb-4 text-[15px]">
            <Link href={`/research/${kind}`} className="font-bold text-teal">
              العودة إلى القائمة
            </Link>
          </p>

          <header>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[14px] font-bold text-ink">
              <span className="text-teal">
                <KindIcon kind={kind} size={18} />
              </span>
              {KIND_META[kind].badge}
            </span>

            <h1 className="mb-4 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
              {paper.title}
            </h1>

            {meta.length > 0 && (
              <dl className="mb-5 flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt className="text-muted">{m.label}</dt>
                    <dd className="font-bold text-ink">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <a
              href="#full-text"
              className="inline-flex items-center rounded-full bg-teal px-5 py-2.5 text-[15px] font-bold text-white no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              اقرأ نص الرسالة
            </a>
          </header>

          {paper.abstract && (
            <section aria-labelledby="abstract-title" className="mt-10">
              <h2 id="abstract-title" className={h2}>
                ملخص الرسالة
              </h2>
              <p className="max-w-3xl whitespace-pre-line text-[17px] leading-loose text-ink">
                {paper.abstract}
              </p>
            </section>
          )}

          {paper.keywords && paper.keywords.length > 0 && (
            <section aria-labelledby="keywords-title" className="mt-8">
              <h2 id="keywords-title" className={h2}>
                الكلمات المفتاحية
              </h2>
              <ul className="flex flex-wrap gap-2">
                {paper.keywords.map((k, n) => (
                  <li
                    key={`${n}-${k}`}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-[14px] font-semibold text-ink"
                  >
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            id="full-text"
            aria-labelledby="text-title"
            className="mt-10 scroll-mt-24"
          >
            <h2 id="text-title" className={h2}>
              نص الرسالة
            </h2>
            <p className="mb-3 text-[15px] text-muted">
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-teal"
              >
                فتح الرسالة بصيغة PDF في صفحة مستقلة
              </a>
            </p>

            <div className="rounded-xl border border-dashed border-line p-3 sm:p-4">
              <PdfPages key={paper._id} url={localPdfUrl(paper.pdfUrl)} />
              <p className="mt-1 text-center text-[15px] font-bold text-muted">
                نهاية الرسالة
              </p>
            </div>
          </section>

          {(prev || next) && (
            <nav
              aria-label="التنقل بين الرسائل"
              className="mt-8 flex justify-between gap-3"
            >
              {prev ? (
                <Link href={`/research/${prev.kind}/${prev.slug}`} className={navBtn}>
                  الرسالة السابقة →
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/research/${next.kind}/${next.slug}`} className={navBtn}>
                  ← الرسالة التالية
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
