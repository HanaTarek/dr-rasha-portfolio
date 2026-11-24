import type { Publisher } from "@/lib/books";

const btn =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-bold no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default function PublisherCard({ publisher }: { publisher: Publisher }) {
  const wa = publisher.whatsapp?.replace(/\D/g, "");

  return (
    <section
      id="full-book"
      aria-labelledby="full-book-title"
      className="scroll-mt-24 rounded-xl border border-s-4 border-line border-s-gold bg-surface p-5 sm:p-6"
    >
      <h2
        id="full-book-title"
        className="mb-2 text-[22px] font-extrabold text-ink"
      >
        احصل على الكتاب كاملًا
      </h2>
      <p className="mb-4 max-w-3xl leading-loose text-muted">
        انتهى الملخص، وهو لا يغني عن قراءة الكتاب. النسخة الكاملة تُطلب من{" "}
        <b className="text-ink">{publisher.name}</b>، الجهة الناشرة.
      </p>

      {(publisher.address || publisher.phone) && (
        <dl className="mb-4 grid gap-2 text-[15px]">
          {publisher.address && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">العنوان:</dt>
              <dd className="font-bold text-ink">{publisher.address}</dd>
            </div>
          )}
          {publisher.phone && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">الهاتف:</dt>
              <dd>
                <a
                  href={`tel:${publisher.phone.replace(/[^\d+]/g, "")}`}
                  dir="ltr"
                  className="inline-block font-bold text-teal"
                >
                  {publisher.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      {publisher.note && (
        <p className="mb-4 text-[15px] leading-relaxed text-muted">
          {publisher.note}
        </p>
      )}

      {(publisher.website || wa) && (
        <div className="flex flex-wrap gap-3">
          {publisher.website && (
            <a
              href={publisher.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-teal text-white`}
            >
              اطلب الكتاب من {publisher.name}
              <span className="sr-only">(يفتح في نافذة جديدة)</span>
            </a>
          )}
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} border border-teal text-teal`}
            >
              تواصل عبر واتساب
              <span className="sr-only">(يفتح في نافذة جديدة)</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
