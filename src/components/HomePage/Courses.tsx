import Section from "./Section";
import Card, { CardGrid } from "./Card";

const courses = [
  { title: "ICDL", text: "دورة الحاسب الآلي وإجادة العمل على جميع البرامج" },
  {
    title: "علم النفس الإيجابي",
    text: "دورة في فنيات علم النفس الإيجابي مع مدرّب من البورد الأمريكي",
  },
  {
    title: "الذكاء الاصطناعي",
    text: "دورات الهيئة العامة للاتصالات في تطبيقات الذكاء الاصطناعي",
  },
  {
    title: "القيادات الإدارية العليا",
    text: "كلية علوم الإدارة لضباط القوات المسلحة",
  },
  {
    title: "TOT",
    text: "تدريب المدربين – كلية علوم الإدارة لضباط القوات المسلحة",
  },
  {
    title: "مهارات الإحصاء بلغة R",
    text: "دورة في مهارات الإحصاء باستخدام لغة R من بوابة الكتابة العلمية والنشر الدولي",
  },
];

export default function Courses() {
  return (
    <Section id="courses" title="الدورات والشهادات">
      <CardGrid>
        {courses.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </CardGrid>
    </Section>
  );
}
