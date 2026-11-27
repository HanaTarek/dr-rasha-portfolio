import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResearchFilterTabs from "@/components/research/ResearchFilterTabs";
import ResearchList from "@/components/research/ResearchList";
import { sanityFetch } from "@/lib/live";
import {
  FILTERS,
  RESEARCH_LIST_QUERY,
  isFilter,
  type Raw,
  type ResearchFilter,
  type ResearchListItem,
} from "@/lib/research";
import { cleanList } from "@/lib/research-clean";

// NOTE: this folder is named [kind] (not [filter]) because /research/[kind]/[slug] lives
// next to it, and Next.js requires the same dynamic-segment name at the same level.
type Props = { params: Promise<{ kind: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params;
  const f = FILTERS.find((x) => x.value === kind);
  return {
    title: `${f?.title ?? "الرسائل العلمية"} | أ.د. رشا محمد أشرف`,
  };
}

export default async function ResearchListPage({ params }: Props) {
  const { kind } = await params;
  if (!isFilter(kind)) notFound();

  const { data } = await sanityFetch({ query: RESEARCH_LIST_QUERY });
  const all = cleanList(data as unknown as Raw<ResearchListItem>[] | null);

  const counts: Record<ResearchFilter, number> = {
    all: all.length,
    supervised: all.filter((r) => r.kind === "supervised").length,
    discussed: all.filter((r) => r.kind === "discussed").length,
  };
  const items = kind === "all" ? all : all.filter((r) => r.kind === kind);
  const filter = FILTERS.find((f) => f.value === kind)!;

  return (
    <main className="mx-auto w-[940px] max-w-full px-5 pb-14 pt-8">
      <p className="mb-4 text-[15px]">
        <Link href="/research" className="font-bold text-teal">
          العودة إلى الرسائل العلمية
        </Link>
      </p>

      <header className="mb-6 max-w-3xl">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          {filter.title}
        </h1>
        <p className="leading-loose text-muted">{filter.intro}</p>
      </header>

      <ResearchFilterTabs active={kind} counts={counts} />

      <div className="max-w-[900px]">
        <ResearchList items={items} showKind={kind === "all"} />
      </div>
    </main>
  );
}
