"use client";

import { useEffect, useRef } from "react";
import type { Embed } from "@/lib/interviews";
import { usePlayer } from "./PlayerProvider";

type Props = {
  /** unique id of this video on the page (used so only one plays at a time) */
  id: string;
  embed: Embed;
  title: string;
  /** custom cover from the Studio; otherwise YouTube's own thumbnail is used */
  poster?: string;
};

export default function VideoEmbed({ id, embed, title, poster }: Props) {
  const { active, play } = usePlayer();
  const playing = active === id;
  const frameRef = useRef<HTMLIFrameElement>(null);

  // keyboard / screen-reader users: move focus into the player that replaced the button
  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  // The URL is always built here from the validated id/url, never from raw CMS text.
  const src =
    embed.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${embed.id}?autoplay=1&rel=0&playsinline=1`
      : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(embed.url)}&show_text=false&autoplay=true`;

  const cover =
    poster ??
    (embed.provider === "youtube"
      ? `https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg`
      : undefined);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-bg">
      {playing ? (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => play(id)}
          aria-label={`تشغيل: ${title}`}
          className="group absolute inset-0 grid w-full place-items-center bg-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {cover && (
            <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20 motion-reduce:transition-none" />
          )}
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-teal text-white shadow-lg transition-transform group-hover:scale-105 motion-reduce:transition-none">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {!cover && (
            <span className="absolute inset-x-0 bottom-3 text-center text-sm font-bold text-muted">
              فيديو من {embed.provider === "facebook" ? "فيسبوك" : "يوتيوب"}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
