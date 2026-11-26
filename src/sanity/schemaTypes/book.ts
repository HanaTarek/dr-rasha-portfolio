import { defineArrayMember, defineField, defineType } from "sanity";
import LinearPdfInput from "../../../public/LinearPdfInput";

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

export const bookType = defineType({
  name: "book",
  title: "كتاب",
  type: "document",
  groups: [
    { name: "basic", title: "بيانات الكتاب", default: true },
    { name: "content", title: "المحتوى والملخص" },
    { name: "publisher", title: "الناشر" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "عنوان الكتاب",
      type: "string",
      group: "basic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "رابط الكتاب",
      description:
        'اضغط "Generate" ليُنشأ تلقائيًا من العنوان (ويمكنك تعديله). حروف إنجليزية فقط، ويظهر في الرابط /books/...',
      type: "slug",
      options: { source: "title", slugify },
      group: "basic",
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
      group: "basic",
      initialValue: 100,
    }),
    defineField({
      name: "cover",
      title: "غلاف الكتاب (الوجه الأمامي والخلفي)",
      description:
        "ارفع صورة الغلاف كاملة بالوجهين (الأمامي والخلفي) في صورة عريضة. تُعرض كما هي في البطاقة وفي أعلى صفحة الكتاب، والنسبة المثالية قريبة من 3:2.",
      type: "image",
      options: { hotspot: true },
      group: "basic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "authors",
      title: "المؤلفون",
      description: "اسم في كل سطر، بالترتيب الذي تريد عرضه",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "basic",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "edition",
      title: "الطبعة",
      description: "مثال: الطبعة الأولى",
      type: "string",
      group: "basic",
    }),
    defineField({
      name: "year",
      title: "سنة النشر",
      description: "مثال: 2017م - 1438هـ",
      type: "string",
      group: "basic",
    }),
    defineField({
      name: "totalPages",
      title: "عدد صفحات الكتاب كاملًا",
      description: 'يظهر في تنبيه "هذا ملخص وليس الكتاب كاملًا"',
      type: "number",
      group: "basic",
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: "description",
      title: "نبذة عن الكتاب",
      description: "فقرة أو فقرتان تشرحان موضوع الكتاب ولمن يتوجه",
      type: "text",
      rows: 6,
      group: "content",
    }),
    defineField({
      name: "chapters",
      title: "محتويات الكتاب (الفصول)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "content",
    }),
    defineField({
      name: "summaryPdf",
      title: "ملخص الكتاب (PDF)",
      description:
        "ملف الملخص أو المقتطفات التي ستُعرض للزائر، وليس الكتاب كاملًا",
      type: "file",
      options: { accept: "application/pdf" },
      group: "content",
      components: { input: LinearPdfInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publisher",
      title: "بيانات الناشر",
      description: "تظهر للزائر تحت الملخص ليعرف كيف يحصل على الكتاب كاملًا",
      type: "object",
      group: "publisher",
      fields: [
        defineField({
          name: "name",
          title: "اسم دار النشر",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "website",
          title: "رابط شراء الكتاب أو موقع الدار",
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
        }),
        defineField({ name: "phone", title: "رقم الهاتف", type: "string" }),
        defineField({
          name: "whatsapp",
          title: "رقم واتساب",
          description: "مع رمز الدولة وبدون +، مثال: 201001234567",
          type: "string",
        }),
        defineField({ name: "address", title: "العنوان", type: "string" }),
        defineField({
          name: "note",
          title: "ملاحظة للزائر",
          description: "مثال: السعر وتوفر النسخ تحدده الدار",
          type: "text",
          rows: 2,
        }),
      ],
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
    select: { title: "title", authors: "authors", media: "cover" },
    prepare: ({ title, authors, media }) => ({
      title,
      subtitle: authors?.[0] ?? "",
      media,
    }),
  },
});
