export type SanityImage = {
  _type: "image";
  asset?: { _type: "reference"; _ref: string };
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

type BlockBase = { _key: string; title: string; anchor?: string };

export type SkillsBlock = BlockBase & { _type: "skillsSection"; skills?: string[] };
export type ListBlock = BlockBase & { _type: "listSection"; items?: string[] };
export type TimelineBlock = BlockBase & {
  _type: "timelineSection";
  items?: { _key: string; year: string; title: string }[];
};
export type CardBlock = BlockBase & {
  _type: "cardSection";
  cards?: { _key: string; title: string; text?: string; items?: string[] }[];
};
export type ContactBlock = BlockBase & { _type: "contactSection"; intro?: string; email?: string };

export type SectionBlock = SkillsBlock | ListBlock | TimelineBlock | CardBlock | ContactBlock;

export type HeroData = {
  name?: string;
  role?: string;
  bio?: string;
  photo?: SanityImage;
  stats?: { _key: string; value: string; label: string }[];
};

export type HomePage = {
  hero?: HeroData;
  sections?: SectionBlock[];
  footerText?: string;
};

export type ArticleItem = { _id: string; title: string; pdfUrl: string };