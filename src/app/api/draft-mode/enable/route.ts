import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/sanity";

// تستدعيها المعاينة المباشرة (Presentation) لتفعيل وضع المسودة
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
