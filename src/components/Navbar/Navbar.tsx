"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logod.png";
import Link from "next/link";

const links = [
  { label: "الرئيسية", href: "/" },
  // { label: "لقاءات", href: "#" },
  { label: "الكتب", href: "/books" },
  { label: "الرسائل", href: "/research" },
  { label: "المقالات", href: "/articles" },
  // { label: "الشهادات", href: "#" },
];

const focusGold =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

/* Change the width here; the height follows the image's own ratio */
const logoSize = "h-[48px] w-auto max-[760px]:h-[38px]";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-line bg-bg">
      <div
        className="mx-auto flex min-h-[72px] max-w-[1000px] items-center gap-5 px-5
                   max-[760px]:flex-wrap max-[760px]:gap-x-2 max-[760px]:gap-y-1.5
                   max-[760px]:pb-1.5 max-[760px]:pt-2.5"
      >
        {/* Brand: both logos are rendered, CSS shows the right one (no flash) */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 no-underline max-[760px]:gap-2"
        >
          <Image
            src={logoLight}
            alt=""
            loading="eager"
            className={`${logoSize} dark:hidden`}
          />
          <Image
            src={logoDark}
            alt=""
            loading="eager"
            className={`${logoSize} hidden dark:block`}
          />
          <span>
            <b className="block text-[17px] font-extrabold leading-snug max-[760px]:text-base">
              أ.د. رشا محمد أشرف
            </b>
            <small className="block text-[13px] font-semibold leading-snug text-teal">
              أستاذ علم النفس الرياضي
            </small>
          </span>
        </Link>

        {/* Links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="mx-auto flex gap-1
                     max-[760px]:order-3 max-[760px]:m-0 max-[760px]:w-full max-[760px]:overflow-x-auto"
        >
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={(e) => {
                // Placeholder pages: don't jump to top until the page exists
                if (l.href === "#") e.preventDefault();
              }}
              className={`rounded-full px-4 py-2 text-base font-semibold text-ink no-underline
                          hover:bg-surface max-[760px]:whitespace-nowrap ${focusGold}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="تبديل الوضع الفاتح والداكن"
          title="تبديل الوضع الفاتح والداكن"
          aria-pressed={isDark}
          className={`grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-full
                      border border-line bg-bg p-0 text-ink hover:bg-surface
                      max-[760px]:ms-auto max-[760px]:size-[38px] ${focusGold}`}
        >
          {/* Moon (shown in light mode) */}
          <svg
            className="dark:hidden"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          {/* Sun (shown in dark mode) */}
          <svg
            className="hidden dark:block"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>

        {/* CTA */}
        <a
          href="#contact"
          className="shrink-0 rounded-full bg-gold px-[26px] py-[9px] font-extrabold text-[#0d2a5c] no-underline
             focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal
             max-[760px]:px-4 max-[760px]:py-2"
        >
          تواصل
        </a>
      </div>
    </header>
  );
}
