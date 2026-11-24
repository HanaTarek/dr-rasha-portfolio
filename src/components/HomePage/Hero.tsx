import Image from "next/image";
import rasha from "@/assets/rasha.png";
import herodeco from "@/assets/hero-deco.png";
const stats = [
  { value: "20+", label: "سنة خبرة" },
  { value: "10+", label: "كتاب علمي" },
  { value: "100+", label: "مشاركة في بحوث ورسائل علمية" },
  { value: "8+", label: "منصب وعضوية" },
];

export default function Hero() {
  return (
    <div
      id="home"
      className="relative overflow-hidden bg-surface pt-8 pb-10 min-[761px]:pt-16 min-[761px]:pb-14"
    >
      {/* decorative side images */}
      <Image
        src={herodeco}
        alt=""
        aria-hidden="true"
        width={291}
        height={560}
        className="pointer-events-none absolute top-1/2 -right-[170px] h-[560px] w-auto -translate-y-1/2 opacity-[.16] max-[760px]:hidden"
      />
      <Image
        src={herodeco}
        alt=""
        aria-hidden="true"
        width={291}
        height={560}
        className="pointer-events-none absolute top-1/2 -left-[170px] h-[560px] w-auto -translate-y-1/2 -scale-x-100 opacity-[.16] max-[760px]:-left-[130px] max-[760px]:h-[360px]"
      />

      <div className="relative mx-auto grid max-w-[1000px] items-center gap-8 px-5 min-[861px]:grid-cols-[1.05fr_.95fr] min-[861px]:gap-12">
        <div>
          <h1 className="mb-2 text-[clamp(34px,5vw,52px)] leading-[1.25] font-extrabold">
            أ.د. رشا محمد أشرف
          </h1>
          <p className="mb-4 text-xl leading-[1.6] font-bold text-teal">
            أستاذ علم النفس الرياضي بكلية علوم الرياضة بنين – جامعة العاصمة
          </p>
          <p className="max-w-[36em] text-[17px] text-muted min-[761px]:text-lg">
            خبرة علمية وتطبيقية في تقييم الخصائص النفسية للرياضيين، وتصميم
            وتطوير أدوات القياس النفسي الرياضي بما يتناسب مع طبيعة المجال
            الرياضي. تتميز بمهارات التحليل الإحصائي للبيانات النفسية، وتوظّف
            نتائج القياس في دعم البحث العلمي وتطوير الأداء وتعزيز الصحة النفسية
            للرياضيين، كما تسعى إلى توظيف النتائج في دعم الإعداد النفسي للارتقاء
            بالمهنة والتخصص.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-block rounded-xl border-2 border-btn bg-btn px-[26px] py-3 font-bold text-btn-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              تواصل معي
            </a>
            <a
              href="#roles"
              className="inline-block rounded-xl border-2 border-btn px-[26px] py-3 font-bold text-btn no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              المناصب والعضويات
            </a>
          </div>
        </div>

        <figure className="m-0 overflow-hidden rounded-[28px] outline-3 outline-offset-6 outline-gold">
          <Image
            src={rasha}
            alt="أ.د. رشا محمد أشرف"
            width={1000}
            height={800}
            priority
            className="block aspect-[5/4] h-auto w-full object-cover"
          />
        </figure>

        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-t-4 border-line border-t-gold bg-bg min-[761px]:mt-6 min-[761px]:grid-cols-4 min-[861px]:col-span-full">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "border-line px-3 py-5 text-center",
                // desktop (4 cols): divider between every stat
                i > 0 ? "min-[761px]:border-s" : "",
                // mobile (2 cols): divider on 2nd column, rule above row 2
                i === 1 ? "max-[760px]:border-s" : "",
                i >= 2 ? "max-[760px]:border-t" : "",
              ].join(" ")}
            >
              <b
                dir="ltr"
                className="block text-[38px] leading-[1.25] font-extrabold"
              >
                {s.value}
              </b>
              <span className="text-[15px] font-semibold text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
