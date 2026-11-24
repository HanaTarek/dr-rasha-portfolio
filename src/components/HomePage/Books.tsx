import Section from "./Section";
import Card, { CardGrid } from "./Card";

// الأحدث أولًا
const books = [
  { title: "سيكولوجية النمو والتعلم الحركي «رؤى تطبيقية لبناء الرياضي»", year: "2026" },
  { title: "الصحة النفسية للرياضيين في عصر الذكاء الاصطناعي الأخضر", year: "2025" },
  { title: "علم النفس الفسيولوجي بالمجال الرياضي", year: "2025" },
  { title: "سيكولوجية السعادة للرياضيين", year: "2024" },
  { title: "الإعداد النفسي للرياضيين", year: "2020" },
  { title: "سيكولوجية الشخصية الرياضية", year: "2011" },
  { title: "علم النفس الرياضي", year: "2008" },
  { title: "التعلم والدافعية في الرياضة", year: "2003" },
];

export default function Books() {
  return (
    <Section id="books" title="المؤلفات العلمية">
      <CardGrid>
        {books.map((b) => (
          <Card key={b.title} title={b.title} text={`صدر عام ${b.year}م`} />
        ))}
      </CardGrid>
    </Section>
  );
}
