import { defineArrayMember, defineField, defineType } from "sanity";

/** الحقول المشتركة بين كل الأقسام */
const common = [
  defineField({
    name: "title",
    title: "عنوان القسم",
    type: "string",
    validation: (r) => r.required().error("العنوان مطلوب"),
  }),
  defineField({
    name: "anchor",
    title: "معرّف الرابط (اختياري)",
    description:
      "حروف إنجليزية صغيرة فقط، مثل: books. يُستخدم في روابط القائمة. لا تغيّره في قسمَي roles و contact.",
    type: "string",
    validation: (r) =>
      r.regex(/^[a-z0-9-]*$/, { name: "english" }).error("حروف إنجليزية صغيرة وأرقام وشرطة فقط"),
  }),
];

const preview = (kind: string) => ({
  select: { title: "title" },
  prepare: ({ title }: { title?: string }) => ({ title: title || "بدون عنوان", subtitle: kind }),
});

export const skillsSection = defineType({
  name: "skillsSection",
  title: "قسم: شرائح قصيرة (مثل مجالات الخبرة)",
  type: "object",
  fields: [
    ...common,
    defineField({
      name: "skills",
      title: "العناصر",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: preview("شرائح"),
});

export const listSection = defineType({
  name: "listSection",
  title: "قسم: قائمة",
  type: "object",
  fields: [
    ...common,
    defineField({
      name: "items",
      title: "العناصر",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: preview("قائمة"),
});

export const timelineSection = defineType({
  name: "timelineSection",
  title: "قسم: خط زمني (سنة + عنوان)",
  type: "object",
  fields: [
    ...common,
    defineField({
      name: "items",
      title: "العناصر",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "timelineItem",
          fields: [
            defineField({ name: "year", title: "السنة", type: "string", validation: (r) => r.required() }),
            defineField({ name: "title", title: "الوصف", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "title", subtitle: "year" } },
        }),
      ],
    }),
  ],
  preview: preview("خط زمني"),
});

export const cardSection = defineType({
  name: "cardSection",
  title: "قسم: بطاقات",
  type: "object",
  fields: [
    ...common,
    defineField({
      name: "cards",
      title: "البطاقات",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "card",
          fields: [
            defineField({ name: "title", title: "عنوان البطاقة", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "نص (اختياري)", type: "text", rows: 3 }),
            defineField({
              name: "items",
              title: "نقاط (اختياري)",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
  ],
  preview: preview("بطاقات"),
});

export const contactSection = defineType({
  name: "contactSection",
  title: "قسم: تواصل",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "intro", title: "نص تمهيدي", type: "text", rows: 2 }),
    defineField({
      name: "email",
      title: "البريد الإلكتروني",
      type: "string",
      validation: (r) => r.email(),
    }),
  ],
  preview: preview("تواصل"),
});
