// The taxonomy is the soul of this project. Categories are mutually exclusive
// buckets; sub-tags are non-exclusive signals that can co-occur on one video.

export type CategoryId = "wealth" | "conflict" | "entertainment" | "fomo" | "genuine";

export interface Category {
  id: CategoryId;
  label: string;
  color: string; // tailwind token name
  hex: string;
  blurb: string;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  wealth: {
    id: "wealth",
    label: "Wealth",
    color: "wealth",
    hex: "#e0b341",
    blurb: "Advertises money, power, status, influence, or advantage over others.",
  },
  conflict: {
    id: "conflict",
    label: "Conflict",
    color: "conflict",
    hex: "#e0533d",
    blurb: "Promotes aggression, fear, mistrust, us-vs-them, outrage, or ragebait.",
  },
  entertainment: {
    id: "entertainment",
    label: "Entertainment",
    color: "ent",
    hex: "#5b8def",
    blurb: "Fun or informative, but inert — you can't actually do anything with it.",
  },
  fomo: {
    id: "fomo",
    label: "FOMO / Scarcity",
    color: "fomo",
    hex: "#b06ee8",
    blurb: "Urgency, secrecy, 'before it's too late', 'nobody is talking about this'.",
  },
  genuine: {
    id: "genuine",
    label: "Genuine",
    color: "genuine",
    hex: "#3fbf8f",
    blurb: "Unity, peace, growth, real help — titled honestly, no engineered hook. The unicorn.",
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "conflict",
  "wealth",
  "fomo",
  "entertainment",
  "genuine",
];

// Sub-tags: the psychological mechanisms layered into a title. Not exclusive.
export type SubTagId =
  | "clickbait"
  | "curiosity_gap"
  | "negativity_bias"
  | "authority_bait"
  | "parasocial"
  | "outrage"
  | "scarcity"
  | "superlative";

export interface SubTag {
  id: SubTagId;
  label: string;
  desc: string;
}

export const SUBTAGS: Record<SubTagId, SubTag> = {
  clickbait: { id: "clickbait", label: "Clickbait", desc: "Title overpromises or withholds the payoff to force a click." },
  curiosity_gap: { id: "curiosity_gap", label: "Curiosity gap", desc: "Hides the key fact ('you won't believe what happened')." },
  negativity_bias: { id: "negativity_bias", label: "Negativity bias", desc: "Leads with threat, failure, or doom to grab attention." },
  authority_bait: { id: "authority_bait", label: "Authority bait", desc: "Leans on credentials, gurus, or 'experts' to borrow trust." },
  parasocial: { id: "parasocial", label: "Parasocial", desc: "Exploits the viewer's one-sided relationship with the creator." },
  outrage: { id: "outrage", label: "Outrage", desc: "Engineered anger or moral indignation." },
  scarcity: { id: "scarcity", label: "Scarcity", desc: "Time pressure or 'limited / secret' framing." },
  superlative: { id: "superlative", label: "Superlative", desc: "'BEST', 'WORST', 'INSANE', 'ULTIMATE' — extreme framing." },
};

export const SUBTAG_ORDER: SubTagId[] = [
  "clickbait",
  "curiosity_gap",
  "outrage",
  "negativity_bias",
  "scarcity",
  "superlative",
  "authority_bait",
  "parasocial",
];

export interface Classification {
  category: CategoryId;
  subtags: SubTagId[];
  bait_score: number; // 0-100, how engineered the title/thumbnail text is
  rationale: string; // one sentence, auditable
}

export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  views?: string;
  publishedAt?: string;
  url: string;
  classification?: Classification;
  error?: string;
}
