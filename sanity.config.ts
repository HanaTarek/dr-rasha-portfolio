import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from "sanity/presentation";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { projectId, dataset, siteUrl } from "./src/sanity/env";

export default defineConfig({
  name: "default",
  title: "موقع أ.د. رشا محمد أشرف",
  projectId,
  dataset,
  plugins: [
    structureTool({
      // مستند واحد ثابت بدل قائمة مستندات
      structure: (S) =>
        S.list()
          .title("المحتوى")
          .items([
            S.listItem()
              .title("الصفحة الرئيسية")
              .id("homePage")
              .child(
                S.document().schemaType("homePage").documentId("homePage"),
              ),
            S.divider(),
            S.documentTypeListItem("article").title("المقالات"),
            S.documentTypeListItem("book").title("الكتب"), // <-- جديد
            S.documentTypeListItem("research").title("الرسائل العلمية"),
          ]),
    }),
    // المعاينة المباشرة: الموقع داخل لوحة التحرير مع النقر للتعديل
    presentationTool({
      previewUrl: {
        initial: siteUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
      allowOrigins: [siteUrl, "http://localhost:*"],
      resolve: {
        mainDocuments: defineDocuments([{ route: "/", type: "homePage" }]),
        locations: {
          homePage: defineLocations({
            select: { title: "hero.name" },
            resolve: () => ({
              locations: [{ title: "الصفحة الرئيسية", href: "/" }],
            }),
          }),
          article: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "المقالات",
                  href: doc?.slug ? `/articles/${doc.slug}` : "/articles",
                },
                { title: "قائمة المقالات", href: "/articles" },
              ],
            }),
          }),
          // <-- جديد: يربط كل كتاب بصفحته في المعاينة المباشرة
          book: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "كتاب",
                  href: doc?.slug ? `/books/${doc.slug}` : "/books",
                },
                { title: "قائمة الكتب", href: "/books" },
              ],
            }),
          }),
          research: defineLocations({
            select: { title: "title", slug: "slug.current", kind: "kind" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "رسالة علمية",
                  href:
                    doc?.slug && doc?.kind
                      ? `/research/${doc.kind}/${doc.slug}`
                      : "/research",
                },
                { title: "الرسائل العلمية", href: "/research" },
              ],
            }),
          }),
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((t) => t.schemaType !== "homePage"),
  },
  document: {
    // منع الحذف/التكرار/إلغاء النشر للصفحة الرئيسية
    actions: (prev, ctx) =>
      ctx.schemaType === "homePage"
        ? prev.filter(
            (a) =>
              !["unpublish", "delete", "duplicate"].includes(a.action ?? ""),
          )
        : prev,
  },
});
