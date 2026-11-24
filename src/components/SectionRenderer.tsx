import { createDataAttribute, stegaClean } from "next-sanity";
import { dataset, projectId, studioUrl } from "@/sanity/env";
import Section from "./Section";
import Card, { CardGrid } from "./Card";
import InfoList from "./InfoList";
import type { SectionBlock } from "@/lib/types";

const chip = "rounded-full border border-line bg-surface px-3.5 py-1.5 text-[15px] font-semibold";
const cta =
  "inline-block rounded-xl border-2 border-btn bg-btn px-[26px] py-3 font-bold text-btn-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

const attr = (path: string) =>
  createDataAttribute({ projectId, dataset, baseUrl: studioUrl, id: "homePage", type: "homePage", path }).toString();

export default function SectionRenderer({
  sections,
  editable = false,
}: {
  sections: SectionBlock[];
  /** true في وضع المعاينة: يفعّل السحب والإفلات لإعادة ترتيب الأقسام */
  editable?: boolean;
}) {
  return (
    <div data-sanity={editable ? attr("sections") : undefined}>
      {sections.map((s, i) => {
        // الخلفية تتبدّل تلقائيًا حسب الترتيب، فلا يحتاج العميل لاختيارها
        const common = {
          // stegaClean: الرموز الخفية قد تفسد الروابط والمعرّفات
          id: stegaClean(s.anchor) || s._key,
          title: s.title,
          alt: i % 2 === 1,
          dataSanity: editable ? attr(`sections[_key=="${s._key}"]`) : undefined,
        };

        switch (s._type) {
          case "skillsSection":
            return (
              <Section key={s._key} {...common}>
                <div className="flex flex-wrap gap-2">
                  {(s.skills ?? []).map((t, n) => (
                    <span key={`${t}-${n}`} className={chip}>
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            );

          case "listSection":
            return (
              <Section key={s._key} {...common}>
                <InfoList items={s.items ?? []} />
              </Section>
            );

          case "timelineSection":
            return (
              <Section key={s._key} {...common}>
                <ul className="grid list-none gap-2.5">
                  {(s.items ?? []).map((it) => (
                    <li
                      key={it._key}
                      className="flex items-center gap-4 rounded-lg border border-line bg-bg px-4 py-3"
                    >
                      <span
                        dir="ltr"
                        className="min-w-16 rounded-full bg-gold px-3 py-0.5 text-center font-extrabold text-[#0d2a5c]"
                      >
                        {it.year}
                      </span>
                      <span>{it.title}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            );

          case "cardSection":
            return (
              <Section key={s._key} {...common}>
                <CardGrid>
                  {(s.cards ?? []).map((c) => (
                    <Card key={c._key} title={c.title} text={c.text} items={c.items} />
                  ))}
                </CardGrid>
              </Section>
            );

          case "contactSection":
            return (
              <Section key={s._key} {...common}>
                {s.intro && <p className="mb-4">{s.intro}</p>}
                {s.email && (
                  <p>
                    <a href={`mailto:${stegaClean(s.email)}`} className={cta}>
                      {s.email}
                    </a>
                  </p>
                )}
              </Section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
