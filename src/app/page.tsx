import { draftMode } from "next/headers";
import Hero from "@/components/Hero";
import SectionRenderer from "@/components/SectionRenderer";
import { sanityFetch } from "@/lib/live";
import { HOME_QUERY } from "@/lib/sanity";
import type { HomePage } from "@/lib/types";

export default async function Home() {
  const [{ data }, { isEnabled: isDraftMode }] = await Promise.all([
    sanityFetch({ query: HOME_QUERY }),
    draftMode(),
  ]);
  const page = data as unknown as HomePage | null;

  if (!page?.hero) {
    return (
      <main className="mx-auto max-w-[1000px] px-5 py-24 text-center text-muted">
        لم يتم إدخال محتوى الصفحة بعد. افتح لوحة التحرير وانشر «الصفحة
        الرئيسية».
      </main>
    );
  }

  return (
    <main>
      <Hero hero={page.hero} />
      <SectionRenderer sections={page.sections ?? []} editable={isDraftMode} />
    </main>
  );
}
