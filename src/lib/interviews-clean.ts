import { stegaClean } from "next-sanity";
import { urlFor } from "./sanity";
import type { SanityImage } from "./types";
import { isLayout, parseVideo, type Embed, type Layout } from "./interviews";

export type RawProgram = {
  _id: string;
  title?: string;
  slug?: string;
  layout?: string | null;
  description?: string;
  videos?:
    | {
        _key: string;
        title?: string;
        description?: string;
        url?: string;
        thumbnail?: SanityImage;
      }[]
    | null;
};

export type Video = {
  _key: string;
  title: string;
  description?: string;
  embed: Embed;
  /** custom cover chosen in the Studio (optional) */
  poster?: string;
};

export type Program = {
  _id: string;
  title: string;
  slug: string;
  layout: Layout;
  description?: string;
  videos: Video[];
};

/**
 * Turns raw Sanity data into safe, ready-to-render data.
 * Every link is re-validated here (never trust the CMS), and invalid videos are skipped.
 */
export function cleanPrograms(raw?: RawProgram[] | null): Program[] {
  return (raw ?? []).flatMap((p) => {
    const slug = stegaClean(p.slug ?? "");
    if (!slug) return [];
    const layout = stegaClean(p.layout ?? "");

    const videos = (p.videos ?? []).flatMap((v): Video[] => {
      const embed = parseVideo(stegaClean(v.url ?? ""));
      if (!embed) {
        console.warn(`[interviews] skipped an invalid link in "${slug}":`, v.url);
        return [];
      }
      const poster = v.thumbnail?.asset
        ? urlFor(v.thumbnail).width(960).auto("format").url()
        : undefined;
      return [
        { _key: v._key, title: v.title ?? "", description: v.description, embed, poster },
      ];
    });
    if (videos.length === 0) return [];

    return [
      {
        _id: p._id,
        title: p.title ?? "",
        slug,
        layout: isLayout(layout) ? layout : "episodes",
        description: p.description,
        videos,
      },
    ];
  });
}
