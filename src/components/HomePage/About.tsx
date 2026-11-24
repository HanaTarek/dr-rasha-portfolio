import Section from "./Section";

const skills = [
  "علم النفس الرياضي",
  "المهارات العقلية",
  "التحليل الإحصائي SPSS",
  "تطبيقات البحث العلمي في مجال التخصص",
  "المقاييس والاختبارات النفسية",
  "تقييم وتطوير الأداء النفسي للرياضيين",
  "تصميم برامج التدخل الإرشادي النفسي",
  "تطبيقات الذكاء الاصطناعي",
];

export default function About() {
  return (
    <Section id="about" title="مجالات الخبرة">
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[15px] font-semibold"
          >
            {s}
          </span>
        ))}
      </div>
    </Section>
  );
}
