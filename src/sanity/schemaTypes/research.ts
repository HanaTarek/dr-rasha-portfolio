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


export const researchType = defineType({
  name: "research",
  title: "رسالة علمية",
  type: "document",
  groups: [
    { name: "basic", title: "بيانات الرسالة", default: true },
    { name: "content", title: "الملخص والملف" },
  ],
  fields: [
    defineField({
      name: "kind",
      title: "نوع الرسالة",
      description: "هل أشرفتِ على هذه الرسالة، أم شاركتِ في مناقشتها؟",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "تم الإشراف عليها", value: "supervised" },
          { title: "تمت مناقشتها", value: "discussed" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "عنوان الرسالة",
      type: "string",
      group: "basic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "رابط الرسالة",
      description:
        'اضغط "Generate" ليُنشأ تلقائيًا من العنوان (ويمكنك تعديله). حروف إنجليزية فقط، ويظهر في الرابط /research/...',
      type: "slug",
      group: "basic",
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
      name: "researcher",
      title: "اسم الباحث",
      type: "string",
      group: "basic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "degree",
      title: "الدرجة العلمية",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "ماجستير", value: "master" },
          { title: "دكتوراه", value: "phd" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "year",
      title: "سنة الإجازة أو المناقشة",
      description: "مثال: 2021",
      type: "number",
      group: "basic",
      validation: (rule) => rule.integer().min(1980).max(2100),
    }),
    defineField({
      name: "institution",
      title: "الجامعة / الكلية",
      description: "اختياري. مثال: كلية علوم الرياضة – جامعة العاصمة",
      type: "string",
      group: "basic",
    }),
    defineField({
      name: "order",
      title: "الترتيب في القائمة",
      description:
        "الرقم الأصغر يظهر أولًا. اتركه 100 لترتيب الرسائل تلقائيًا من الأحدث إلى الأقدم.",
      type: "number",
      group: "basic",
      initialValue: 100,
    }),
    defineField({
      name: "abstract",
      title: "ملخص الرسالة",
      description: "اختياري. فقرة أو فقرتان عن موضوع الرسالة ونتائجها",
      type: "text",
      rows: 6,
      group: "content",
    }),
    defineField({
      name: "keywords",
      title: "الكلمات المفتاحية",
      description: "اختياري. تساعد الزائر في البحث داخل القائمة",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "pdf",
      title: "نص الرسالة (PDF)",
      description: "ارفع ملف الرسالة بصيغة PDF",
      type: "file",
      options: { accept: "application/pdf" },
      group: "content",
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
    {
      title: "السنة (الأحدث أولًا)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", kind: "kind", researcher: "researcher" },
    prepare: ({ title, kind, researcher }) => ({
      title,
      subtitle: `${kind === "supervised" ? "إشراف" : kind === "discussed" ? "مناقشة" : "—"}${researcher ? ` – ${researcher}` : ""}`,
    }),
  },
});
