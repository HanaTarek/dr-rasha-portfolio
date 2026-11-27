/*
 * Two flat illustrations for the hub cards. Inline SVG on purpose: no image files to
 * manage, no layout shift, and they follow the site's light/dark theme colors.
 *   SupervisedArt : a mentor and a student guiding a thesis (the idea of "supervision")
 *   DiscussedArt  : a committee seated behind a table, a thesis in front (the idea of "defense")
 */
const svgProps = {
  viewBox: "0 0 360 200",
  className: "block h-full w-full",
  "aria-hidden": true,
  focusable: false,
} as const;

export function SupervisedArt() {
  return (
    <svg {...svgProps}>
      <circle cx="180" cy="106" r="86" className="fill-teal/10" />
      <circle cx="52" cy="44" r="5" className="fill-gold/70" />
      <circle cx="314" cy="38" r="4" className="fill-teal/50" />
      <circle cx="330" cy="150" r="6" className="fill-gold/40" />
      <path d="M24 172H336" className="stroke-line" strokeWidth="2" strokeLinecap="round" />

      {/* the thesis */}
      <rect x="140" y="44" width="80" height="110" rx="8" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="152" y="58" width="38" height="7" rx="3.5" className="fill-gold" />
      <rect x="152" y="76" width="56" height="5" rx="2.5" className="fill-teal/40" />
      <rect x="152" y="88" width="48" height="5" rx="2.5" className="fill-teal/40" />
      <rect x="152" y="100" width="56" height="5" rx="2.5" className="fill-teal/40" />
      <rect x="152" y="112" width="34" height="5" rx="2.5" className="fill-teal/40" />
      <circle cx="198" cy="136" r="9" className="fill-teal" />
      <path d="M193.5 136l3.2 3.2 5.8-6.4" fill="none" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* student (left) */}
      <path d="M62 172a28 28 0 0 1 56 0z" className="fill-gold" />
      <circle cx="90" cy="128" r="15" className="fill-gold" />
      <path d="M90 99l28 11-28 11-28-11z" className="fill-ink" />
      <path d="M118 110v13" className="stroke-gold" strokeWidth="2" strokeLinecap="round" />
      <path d="M106 152l30-16" className="stroke-gold" strokeWidth="7" strokeLinecap="round" />

      {/* mentor (right) */}
      <path d="M238 172a34 34 0 0 1 68 0z" className="fill-teal" />
      <circle cx="272" cy="118" r="19" className="fill-teal" />
      <path d="M248 152l-24-22" className="stroke-teal" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function DiscussedArt() {
  return (
    <svg {...svgProps}>
      <circle cx="180" cy="106" r="86" className="fill-gold/10" />
      <circle cx="326" cy="132" r="5" className="fill-teal/50" />
      <circle cx="36" cy="124" r="6" className="fill-gold/50" />

      {/* speech bubble */}
      <rect x="34" y="30" width="64" height="38" rx="10" className="fill-surface stroke-line" strokeWidth="2" />
      <path d="M54 68l-6 12 18-12z" className="fill-surface stroke-line" strokeWidth="2" strokeLinejoin="round" />
      <rect x="44" y="42" width="44" height="5" rx="2.5" className="fill-teal/40" />
      <rect x="44" y="53" width="28" height="5" rx="2.5" className="fill-teal/40" />

      {/* approval badge */}
      <circle cx="312" cy="52" r="20" className="fill-gold" />
      <path d="M302 52l7 7 13-14" fill="none" className="stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* committee */}
      <path d="M70 152a30 30 0 0 1 60 0z" className="fill-teal" />
      <circle cx="100" cy="104" r="16" className="fill-teal" />
      <path d="M150 152a30 30 0 0 1 60 0z" className="fill-gold" />
      <circle cx="180" cy="104" r="16" className="fill-gold" />
      <path d="M230 152a30 30 0 0 1 60 0z" className="fill-teal" />
      <circle cx="260" cy="104" r="16" className="fill-teal" />

      {/* table */}
      <rect x="48" y="134" width="264" height="18" rx="6" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="62" y="152" width="236" height="24" rx="4" className="fill-bg stroke-line" strokeWidth="2" />

      {/* thesis on the table */}
      <rect x="148" y="125" width="64" height="9" rx="2" className="fill-white stroke-line" strokeWidth="1.5" />
      <rect x="154" y="128" width="26" height="3" rx="1.5" className="fill-gold" />
    </svg>
  );
}
