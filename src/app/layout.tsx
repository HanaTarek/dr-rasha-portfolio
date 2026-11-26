import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import { sanityFetch, SanityLive } from "@/lib/live";
import { HOME_QUERY } from "@/lib/sanity";
import type { HomePage } from "@/lib/types";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "أ.د. رشا محمد أشرف | أستاذ علم النفس الرياضي",
  description:
    "أستاذ علم النفس الرياضي بكلية علوم الرياضة بنين – جامعة العاصمة. كتب ورسائل علمية ومحاضرات واستشارات.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [{ data }, { isEnabled: isDraftMode }] = await Promise.all([
    sanityFetch({ query: HOME_QUERY }),
    draftMode(),
  ]);
  const page = data as unknown as HomePage | null;

  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="dark"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer text={page?.footerText} />
        </ThemeProvider>
        {/* Mounted ONCE for the whole site: a single live-events connection that survives navigation */}
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
