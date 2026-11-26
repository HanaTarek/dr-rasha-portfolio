import { defineField, defineType } from "sanity";
import LinearPdfInput from "../../../public/LinearPdfInput";
import { defineArrayMember} from "sanity";


// Arabic -> Latin letters, so the slug can be generated from the Arabic title.
const AR: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "a",
  ٱ: "a",
  ء: "",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "th",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  ة: "a",
  و: "w",
  ى: "a",
  ي: "y",
  ئ: "y",
  ؤ: "w",
};

const slugify = (input: string) =>
  input
    .replace(/[\u064B-\u065F\u0640]/g, "") // Arabic diacritics and tatweel
    .split("")
    .map((c) => AR[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);


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
            'اضغط "Generate" ليُنشأ تلقائيًا من العنوان (ويمكنك تعديله). حروف إنجليزية فقط، ويظهر في الرابط /books/...',
          type: "slug",
          options: { source: "title", slugify },
          validation: (rule) =>
            rule.required().custom((value) => {
              const s = value?.current;
              if (!s) return true;
              return (
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) ||
                "حروف إنجليزية صغيرة وأرقام وشرطات (-) فقط"
              );
            }),
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
