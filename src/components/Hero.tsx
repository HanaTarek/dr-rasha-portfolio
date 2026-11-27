import Image from "next/image";
import { stegaClean } from "next-sanity";
import { urlFor } from "@/lib/sanity";
import type { HeroData } from "@/lib/types";
import deco from "@/assets/hero-deco.png";
import rasha from "@/assets/rasha.png";

export default function Hero({ hero }: { hero: HeroData }) {
  const stats = hero.stats ?? [];
  const photoUrl = hero.photo?.asset
    ? urlFor(hero.photo).width(1000).height(800).fit("crop").auto("format").url()
    : null;

  return (
    <div
      id="home"
      className="relative overflow-hidden bg-surface pt-8 pb-10 min-[761px]:pt-16 min-[761px]:pb-14"
    >
      {/* decorative side images */}
      <Image
        src={deco}
        alt=""
        aria-hidden="true"
        width={291}
        height={560}
        className="pointer-events-none absolute top-1/2 -right-[170px] h-[560px] w-auto -translate-y-1/2 opacity-[.16] max-[760px]:hidden"
      />
      <Image
        src={deco}
        alt=""
        aria-hidden="true"
        width={291}
        height={560}
        className="pointer-events-none absolute top-1/2 -left-[170px] h-[560px] w-auto -translate-y-1/2 -scale-x-100 opacity-[.16] max-[760px]:-left-[130px] max-[760px]:h-[360px]"
      />

      <div className="relative mx-auto grid max-w-[1000px] items-center gap-8 px-5 min-[861px]:grid-cols-[1.05fr_.95fr] min-[861px]:gap-12">
        <div>
          <h1 className="mb-2 text-[clamp(34px,5vw,52px)] leading-[1.25] font-extrabold">{hero.name}</h1>
          {hero.role && <p className="mb-4 text-xl leading-[1.6] font-bold text-teal">{hero.role}</p>}
          {hero.bio && (
            <p className="max-w-[36em] text-[17px] whitespace-pre-line text-muted min-[761px]:text-lg">
              {hero.bio}
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-block rounded-xl border-2 border-btn bg-btn px-[26px] py-3 font-bold text-btn-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              تواصل معي
            </a>
            {/* <a
              href="#roles"
              className="inline-block rounded-xl border-2 border-btn px-[26px] py-3 font-bold text-btn no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              المناصب والعضويات
            </a> */}
          </div>
        </div>

        <figure className="m-0 overflow-hidden rounded-[28px] outline-3 outline-offset-6 outline-gold">
          {photoUrl ? (
            // Sanity CDN يقدّم الصورة مُصغّرة ومضغوطة مسبقًا
            <Image
              src={photoUrl}
              alt={stegaClean(hero.name ?? "")}
              width={1000}
              height={800}
              priority
              unoptimized
              className="block aspect-[5/4] h-auto w-full object-cover"
            />
          ) : (
            <Image
              src={rasha}
              alt={stegaClean(hero.name ?? "")}
              width={1000}
              height={800}
              priority
              className="block aspect-[5/4] h-auto w-full object-cover"
            />
          )}
        </figure>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-t-4 border-line border-t-gold bg-bg min-[761px]:mt-6 min-[761px]:grid-cols-4 min-[861px]:col-span-full">
            {stats.map((s, i) => (
              <div
                key={s._key}
                className={[
                  "border-line px-3 py-5 text-center",
                  i > 0 ? "min-[761px]:border-s" : "",
                  i === 1 ? "max-[760px]:border-s" : "",
                  i >= 2 ? "max-[760px]:border-t" : "",
                ].join(" ")}
              >
                <b dir="ltr" className="block text-[38px] leading-[1.25] font-extrabold">
                  {s.value}
                </b>
                <span className="text-[15px] font-semibold text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
