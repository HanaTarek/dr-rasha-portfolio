import { defineArrayMember, defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "الصفحة الرئيسية",
  type: "document",
  groups: [
    { name: "hero", title: "الواجهة", default: true },
    { name: "sections", title: "الأقسام" },
    { name: "footer", title: "التذييل" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "واجهة الموقع",
      type: "object",
      group: "hero",
      options: { collapsible: false },
      fields: [
        defineField({ name: "name", title: "الاسم", type: "string", validation: (r) => r.required() }),
        defineField({ name: "role", title: "المسمى الوظيفي", type: "string" }),
        defineField({ name: "bio", title: "نبذة", type: "text", rows: 6 }),
        defineField({
          name: "photo",
          title: "الصورة الشخصية",
          description: "يفضّل صورة أفقية بنسبة 5:4",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "stats",
          title: "الأرقام (الإحصائيات)",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "stat",
              fields: [
                defineField({ name: "value", title: "الرقم", description: "مثال: 20+", type: "string" }),
                defineField({ name: "label", title: "الوصف", type: "string" }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
          validation: (r) => r.max(4).warning("يظهر الموقع 4 أرقام بشكل أنيق"),
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "أقسام الصفحة",
      description: "اسحب لإعادة الترتيب، واضغط «إضافة» لقسم جديد.",
      type: "array",
      group: "sections",
      of: [
        defineArrayMember({ type: "skillsSection" }),
        defineArrayMember({ type: "listSection" }),
        defineArrayMember({ type: "timelineSection" }),
        defineArrayMember({ type: "cardSection" }),
        defineArrayMember({ type: "contactSection" }),
      ],
    }),
    defineField({ name: "footerText", title: "نص التذييل", type: "string", group: "footer" }),
  ],
  preview: { prepare: () => ({ title: "الصفحة الرئيسية" }) },
});



