import { createClient } from "next-sanity";
import createImageUrlBuilder from "@sanity/image-url";
import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/env";
import type { SanityImage } from "./types";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // يربط النقر على النص في الموقع بالحقل المقابل في لوحة التحرير (يعمل في وضع المعاينة فقط)
  stega: { studioUrl },
});

const builder = createImageUrlBuilder({ projectId, dataset });
export const urlFor = (source: SanityImage) => builder.image(source);

export const HOME_QUERY = `*[_id == "homePage"][0]`;
