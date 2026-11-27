import type { Metadata } from "next";
import { sanityFetch } from "@/lib/live";
import { INTERVIEWS_QUERY, clipCount, episodeCount } from "@/lib/interviews";
import {
  cleanPrograms,
  type Program,
  type RawProgram,
} from "@/lib/interviews-clean";
import { PlayerProvider } from "@/components/PlayerProvider";
import VideoEmbed from "@/components/VideoEmbed";

export const metadata: Metadata = {
  title: "اللقاءات | أ.د. رشا محمد أشرف",
};

export default async function InterviewsPage() {
  const { data } = await sanityFetch({ query: INTERVIEWS_QUERY });
  const programs = cleanPrograms((data ?? []) as unknown as RawProgram[]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8">
      <header className="mb-7 max-w-3xl">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          اللقاءات
        </h1>
        <p className="leading-loose text-muted">
          برامج وسلاسل لقاءات مرئية. اضغط على أي فيديو لمشاهدته مباشرة هنا في
          الصفحة.
        </p>
      </header>

      {programs.length === 0 ? (
        <p className="rounded-lg border border-s-4 border-line border-s-teal bg-surface p-5 text-muted">
          لا توجد لقاءات بعد.
        </p>
      ) : (
        // One provider for the whole page → only one video plays at a time
        <PlayerProvider>
          <div className="space-y-14">
            {programs.map((program) => (
              <ProgramSection key={program._id} program={program} />
            ))}
          </div>
        </PlayerProvider>
      )}
    </main>
  );
}

function ProgramSection({ program }: { program: Program }) {
  const isEpisodes = program.layout === "episodes";
  const count = isEpisodes
    ? episodeCount(program.videos.length)
    : clipCount(program.videos.length);

  return (
    <section id={program.slug} aria-labelledby={`${program._id}-title`}>
      <header className="mb-6">
        <h2 id={`${program._id}-title`} className="text-2xl font-bold text-ink">
          {program.title}
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">{count}</p>
        {program.description && (
          <p className="mt-3 max-w-3xl leading-8 text-muted">
            {program.description}
          </p>
        )}
      </header>

      {isEpisodes ? (
        <ul className="space-y-8">
          {program.videos.map((v, i) => (
            <li
              key={v._key}
              className="grid items-start gap-5 md:grid-cols-[3fr_2fr]"
            >
              <VideoEmbed
                id={`${program._id}-${v._key}`}
                embed={v.embed}
                title={v.title}
                poster={v.poster}
              />
              <div>
                <p className="text-sm font-bold text-teal">الحلقة {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{v.title}</h3>
                {v.description && (
                  <p className="mt-2 leading-8 text-muted">{v.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {program.videos.map((v) => (
            <li
              key={v._key}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <VideoEmbed
                id={`${program._id}-${v._key}`}
                embed={v.embed}
                title={v.title}
                poster={v.poster}
              />
              <div className="p-4">
                <h3 className="font-bold">{v.title}</h3>
                {v.description && (
                  <p className="mt-1 text-sm leading-7 text-muted">
                    {v.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
