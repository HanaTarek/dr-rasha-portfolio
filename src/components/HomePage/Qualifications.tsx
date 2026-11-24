import Section from "./Section";

const items = [
  { year: "1994", title: "بكالوريوس التربية الرياضية" },
  { year: "1998", title: "ماجستير الفلسفة في التربية الرياضية" },
  { year: "2000", title: "دبلوم في القياس النفسي – كلية التربية، جامعة عين شمس" },
  { year: "2002", title: "دكتوراه الفلسفة في التربية الرياضية" },
  { year: "2007", title: "أستاذ مساعد – تخصص علم النفس الرياضي" },
  { year: "2014", title: "أستاذ – تخصص علم النفس الرياضي" },
];

export default function Qualifications() {
  return (
    <Section id="qualifications" title="المؤهلات والدرجات العلمية" alt>
      <ul className="grid list-none gap-2.5">
        {items.map((it) => (
          <li
            key={it.year}
            className="flex items-center gap-4 rounded-lg border border-line bg-bg px-4 py-3"
          >
            <span
              dir="ltr"
              className="min-w-16 rounded-full bg-gold px-3 py-0.5 text-center font-extrabold text-[#0d2a5c]"
            >
              {it.year}
            </span>
            <span>{it.title}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
