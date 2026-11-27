// Pure helpers shared by the Studio (validation) and the website (rendering).
// Do NOT import next-sanity or anything server-only here: the Studio imports this file.

export type Layout = "episodes" | "clips";
export const isLayout = (v: unknown): v is Layout =>
  v === "episodes" || v === "clips";

export type Embed =
  | { provider: "youtube"; id: string; url: string }
  | { provider: "facebook"; url: string };

export const PROVIDER_LABEL = { youtube: "يوتيوب", facebook: "فيسبوك" } as const;

const YT_ID = /^[\w-]{11}$/;
const FB_ORIGIN = "https://www.facebook.com";

/**
 * Accepts ONLY a single video on YouTube or Facebook. Anything else returns null,
 * so a page, a profile, a playlist or a random site can never reach an <iframe>.
 * The returned `url` is rebuilt from the parsed parts (tracking params are dropped).
 */
export function parseVideo(input?: string | null): Embed | null {
  if (!input) return null;
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const host = u.hostname.toLowerCase().replace(/^(www|m|web|mbasic)\./, "");
  const parts = u.pathname.split("/").filter(Boolean);

  // ---- YouTube ----
  if (host === "youtu.be" || host === "youtube.com") {
    let id: string | null | undefined = null;
    if (host === "youtu.be") id = parts[0];
    else if (parts[0] === "watch") id = u.searchParams.get("v");
    else if (["embed", "shorts", "live"].includes(parts[0])) id = parts[1];

    // "videoseries" is exactly 11 characters: it is the embed path of a PLAYLIST, not a video
    return id && id !== "videoseries" && YT_ID.test(id)
      ? { provider: "youtube", id, url: `https://www.youtube.com/watch?v=${id}` }
      : null;
  }

  // ---- Facebook ----
  if (host === "fb.watch") {
    return parts[0] && /^[\w-]+$/.test(parts[0])
      ? { provider: "facebook", url: `https://fb.watch/${parts[0]}/` }
      : null;
  }

  if (host === "facebook.com") {
    const path = u.pathname;

    // facebook.com/watch/?v=123   and   facebook.com/video.php?v=123
    if (/^\/(watch|video\.php)\/?$/.test(path)) {
      const v = u.searchParams.get("v");
      return v && /^\d+$/.test(v)
        ? { provider: "facebook", url: `${FB_ORIGIN}${path}?v=${v}` }
        : null;
    }

    // facebook.com/reel/123   |   /share/v/xxxx   |   /share/r/xxxx
    // facebook.com/videos/123   |   facebook.com/<page>/videos/123
    if (
      /^\/reel\/\d+/.test(path) ||
      /^\/share\/[vr]\/[\w-]+/.test(path) ||
      /^\/(?:[^/]+\/)?videos\/[^/]+/.test(path)
    ) {
      return { provider: "facebook", url: `${FB_ORIGIN}${path}` };
    }
  }

  return null;
}

function plural(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one;
  if (n === 2) return two;
  return `${n} ${n <= 10 ? few : many}`;
}
export const episodeCount = (n: number) =>
  plural(n, "حلقة واحدة", "حلقتان", "حلقات", "حلقة");
export const clipCount = (n: number) =>
  plural(n, "مقطع واحد", "مقطعان", "مقاطع", "مقطعًا");

export const INTERVIEWS_QUERY = `*[_type == "interviewProgram" && defined(slug.current)] | order(order asc, _createdAt asc){
  _id, title, "slug": slug.current, layout, description,
  "videos": videos[defined(url)]{ _key, title, description, url, thumbnail }
}`;
