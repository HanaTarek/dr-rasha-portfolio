import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/lib/types";

type Props = {
  image?: SanityImage;
  title: string;
  /** the `sizes` attribute, so the browser downloads the right width */
  sizes: string;
  priority?: boolean;
  className?: string;
};

export default function BookCover({
  image,
  title,
  sizes,
  priority = false,
  className = "",
}: Props) {
  const frame = `aspect-[3/2] w-full overflow-hidden rounded-md border border-line bg-surface shadow-[0_6px_22px_rgba(13,42,92,0.12)] ${className}`;

  if (!image?.asset) {
    return (
      <div
        className={`${frame} grid place-items-center text-muted`}
        role="img"
        aria-label={`غلاف كتاب ${title}`}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
          <path d="M4 19a2 2 0 0 1 2-2h13" />
        </svg>
      </div>
    );
  }

  // urlFor applies the crop/hotspot chosen in the Studio
  const src = (w: number) => urlFor(image).width(w).auto("format").url();

  return (
    <div className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src(800)}
        srcSet={`${src(480)} 480w, ${src(800)} 800w, ${src(1200)} 1200w, ${src(1600)} 1600w`}
        sizes={sizes}
        alt={`غلاف كتاب ${title} (الوجه الأمامي والخلفي)`}
        width={1200}
        height={800}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
