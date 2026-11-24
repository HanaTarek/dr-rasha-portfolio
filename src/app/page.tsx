import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import Hero from "@/components/Hero";
import SectionRenderer from "@/components/SectionRenderer";
import { sanityFetch, SanityLive } from "@/lib/live";
import { HOME_QUERY } from "@/lib/sanity";
import type { HomePage } from "@/lib/types";

export default async function Home() {
  const { data } = await sanityFetch({ query: HOME_QUERY });
  const page = data as unknown as HomePage | null;
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <>
      {!page?.hero ? (
        <main className="mx-auto max-w-[1000px] px-5 py-24 text-center text-muted">
          لم يتم إدخال محتوى الصفحة بعد. افتح لوحة التحرير وانشر «الصفحة الرئيسية».
        </main>
      ) : (
        <main>
          <Hero hero={page.hero} />
          <SectionRenderer sections={page.sections ?? []} editable={isDraftMode} />
          
        </main>
      )}
      <SanityLive />
      {isDraftMode && <VisualEditing />}
    </>
  );
}
