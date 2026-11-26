export const localPdfUrl = (url: string) =>
  url.replace(/^https:\/\/cdn\.sanity\.io\/files\/[^/]+\/[^/]+\//, "/pdf/");
