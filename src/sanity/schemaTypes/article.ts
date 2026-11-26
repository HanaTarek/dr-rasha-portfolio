import { defineField, defineType } from "sanity";
import LinearPdfInput from "../../../public/LinearPdfInput";
import { slugify, slugValidation } from "@/lib/slugify";

export const articleType = defineType({
  name: "article",
  title: "مقال",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "عنوان المقال",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "رابط المقال",
      description:
        'اضغط "Generate" ليُنشأ تلقائيًا من العنوان (ويمكنك تعديله). حروف إنجليزية فقط، ويظهر في الرابط /articles/...',
      type: "slug",
      options: { source: "title", slugify },
      validation: (rule) => rule.required().custom(slugValidation),
    }),
    defineField({
      name: "order",
      title: "الترتيب في القائمة",
      description: "الرقم الأصغر يظهر أولًا",
      type: "number",
      initialValue: 100,
    }),
    defineField({
      name: "pdf",
      title: "ملف المقال (PDF)",
      description: "صدّر عرض PowerPoint بصيغة PDF ثم ارفعه هنا",
      type: "file",
      options: { accept: "application/pdf" },
      components: { input: LinearPdfInput },
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "الترتيب",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare: ({ title, order }) => ({
      title,
      subtitle: `الترتيب: ${order ?? "-"}`,
    }),
  },
});
