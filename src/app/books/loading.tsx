export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-14 pt-8">
      <span role="status" className="sr-only">
        جارٍ تحميل الكتب…
      </span>

      <header className="mb-7 max-w-3xl">
        <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          الكتب
        </h1>
        <p className="leading-loose text-muted">
          اختر كتابًا لتتعرّف على محتواه وتقرأ ملخصًا تعريفيًا منه. الملخص لا يغني
          عن الكتاب؛ وستجد في صفحة كل كتاب بيانات الناشر للحصول على النسخة
          الكاملة.
        </p>
      </header>

      <ul
        aria-hidden="true"
        className="grid grid-cols-1 gap-5 animate-pulse motion-reduce:animate-none sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* 6 cards = 2 full rows on desktop, so the page is as tall as the real one */}
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-3.5">
              {/* cover: same frame as BookCover */}
              <div className="aspect-[3/2] w-full rounded-md border border-line bg-bg shadow-[0_6px_22px_rgba(13,42,92,0.12)]" />

              <div className="flex-1">
                {/* title line box = text-[18px] × leading-relaxed (~29px) */}
                <div className="mt-3.5 flex h-[29px] items-center">
                  <div className="h-5 w-4/5 rounded bg-line/60" />
                </div>
                {/* author line box = text-[14px] × leading-relaxed (~23px) */}
                <div className="mt-1 flex h-[23px] items-center">
                  <div className="h-3.5 w-1/2 rounded bg-line/60" />
                </div>
              </div>

              {/* footer: "تفاصيل الكتاب" + circle button */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                <div className="h-5 w-24 rounded bg-line/60" />
                <div className="h-8 w-8 rounded-full border border-line bg-bg" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
