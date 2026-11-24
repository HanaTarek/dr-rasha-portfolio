import Section from "./Section";
import InfoList from "./InfoList";

const items = [
  "عضو مشروع تطوير الدراسات العليا (HEEPE) بكلية علوم الرياضة بنين بالهرم",
  "نائب وحدة التقييم الطلابي التابعة لوحدة ضمان الجودة والاعتماد بالكلية",
  "عضو مشروع تطوير نظم تقييم الطلاب بالتعاون مع جامعتي حلوان وأسيوط",
];

export default function Quality() {
  return (
    <Section id="quality" title="الجودة وتطوير الكلية" alt>
      <InfoList items={items} />
    </Section>
  );
}
