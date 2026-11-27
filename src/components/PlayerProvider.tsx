"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/*
 * Keeps track of WHICH video is playing. Starting a new one switches every other
 * video back to its thumbnail, so two videos never play at the same time.
 */
type PlayerCtx = { active: string | null; play: (id: string) => void };

const PlayerContext = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const value = useMemo<PlayerCtx>(() => ({ active, play: setActive }), [active]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerCtx {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
