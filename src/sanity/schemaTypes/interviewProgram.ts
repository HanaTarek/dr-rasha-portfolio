import { defineArrayMember, defineField, defineType } from "sanity";
import { parseVideo } from "@/lib/interviews";

// Arabic-friendly slug (Sanity's default slugify removes Arabic letters).
// If you already have your own slugify helper, you can import it instead.
const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFKC")
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export const interviewProgram = defineType({
  name: "interviewProgram",
  title: "برنامج / سلسلة لقاءات",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "اسم البرنامج",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "الرابط المختصر",
      type: "slug",
      description: "يُستخدم في رابط الصفحة. اضغطي «Generate» لإنشائه من الاسم.",
      options: { source: "title", slugify },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "layout",
      title: "طريقة العرض",
      type: "string",
      initialValue: "episodes",
      options: {
        layout: "radio",
        list: [
          { title: "حلقات (فيديو كبير بجانب الوصف)", value: "episodes" },
          { title: "مقاطع قصيرة (شبكة بطاقات)", value: "clips" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "وصف البرنامج",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "الترتيب في الصفحة",
      type: "number",
      description: "الأصغر يظهر أولًا.",
      initialValue: 100,
    }),
    defineField({
      name: "videos",
      title: "الفيديوهات",
      type: "array",
      description:
        "رتّبي الفيديوهات بالسحب. في عرض «حلقات» يكون ترتيبها هنا هو رقم الحلقة في الموقع.",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "interviewVideo",
          fields: [
            defineField({
              name: "title",
              title: "عنوان الفيديو",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "رابط الفيديو",
              type: "url",
              description:
                "الصقي رابط فيديو واحد من يوتيوب أو فيسبوك (وليس قائمة تشغيل أو صفحة). يجب أن يكون الفيديو عامًا (Public).",
              validation: (r) =>
                r
                  .required()
                  .uri({ scheme: ["https", "http"] })
                  .custom((v) =>
                    parseVideo(v)
                      ? true
                      : "الرابط غير مدعوم: استخدمي رابط فيديو واحد من يوتيوب أو فيسبوك.",
                  ),
            }),
            defineField({
              name: "description",
              title: "وصف الفيديو",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "thumbnail",
              title: "صورة الغلاف (اختياري)",
              type: "image",
              options: { hotspot: true },
              description:
                "يوتيوب يوفّر صورة تلقائيًا. أما فيسبوك فلا يوفّر، فيُنصح برفع صورة لمقاطع فيسبوك.",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "url", media: "thumbnail" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", videos: "videos" },
    prepare: ({ title, videos }) => ({
      title,
      subtitle: `${videos?.length ?? 0} فيديو`,
    }),
  },
});
