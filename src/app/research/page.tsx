import type { Metadata } from "next";
import Link from "next/link";
import ResearchHubCard from "@/components/research/ResearchHubCard";
import ResearchHubHeader from "@/components/research/ResearchHubHeader";
import {
  DiscussedArt,
  SupervisedArt,
} from "@/components/research/ResearchArt";
import { sanityFetch } from "@/lib/live";
import { KIND_META, RESEARCH_HUB_QUERY, countLabel } from "@/lib/research";

export const metadata: Metadata = {
  title: "الرسائل العلمية | أ.د. رشا محمد أشرف",
};

export default async function ResearchHubPage() {
  const { data } = await sanityFetch({ query: RESEARCH_HUB_QUERY });
  const counts = (data ?? {}) as { supervised?: number; discussed?: number };
  const supervised = counts.supervised ?? 0;
  const discussed = counts.discussed ?? 0;
  const total = supervised + discussed;

  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-14 pt-8">
      <ResearchHubHeader />

      <div className="mx-auto grid max-w-[920px] gap-6 md:grid-cols-2">
        <ResearchHubCard
          href="/research/supervised"
          title={KIND_META.supervised.title}
          description={KIND_META.supervised.description}
          count={supervised}
          art={<SupervisedArt />}
        />
        <ResearchHubCard
          href="/research/discussed"
          title={KIND_META.discussed.title}
          description={KIND_META.discussed.description}
          count={discussed}
          art={<DiscussedArt />}
        />
      </div>

      {total > 0 && (
        <p className="mt-7 text-center">
          <Link
            href="/research/all"
            className="inline-flex items-center rounded-full border border-teal px-6 py-2.5 text-[15px] font-bold text-teal no-underline hover:bg-teal hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            عرض كل الرسائل ({countLabel(total)})
          </Link>
        </p>
      )}
    </main>
  );
}
