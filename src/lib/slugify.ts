// src/sanity/lib/slugify.ts
const AR: Record<string, string> = {
  // ← paste your whole AR map here, unchanged
};

export const slugify = (input: string) => input;

// ← paste the body of your slugify function here, unchanged
export const slugValidation = (value?: { current?: string }) => {
  const s = value?.current;
  if (!s) return true;
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) ||
    "حروف إنجليزية صغيرة وأرقام وشرطات (-) فقط"
  );
};
