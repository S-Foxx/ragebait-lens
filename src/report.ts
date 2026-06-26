import type { CategoryId, SubTagId, VideoItem } from "./taxonomy";
import { CATEGORY_ORDER, SUBTAG_ORDER } from "./taxonomy";

export interface Report {
  total: number;
  classified: number;
  errors: number;
  categoryCounts: Record<CategoryId, number>;
  categoryPct: Record<CategoryId, number>;
  subtagCounts: Record<SubTagId, number>;
  avgBait: number;
  baitDistribution: { label: string; count: number }[];
  // The headline: share of feed that is engineered to hook (everything but genuine)
  engineeredPct: number;
}

// Round a set of counts to integer percentages that sum to exactly `total`'s 100%.
function largestRemainder(counts: number[], total: number): number[] {
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const floors = raw.map((r) => Math.floor(r));
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  // distribute the leftover to the largest fractional parts
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    result[order[k].i]++;
  }
  return result;
}

export function buildReport(videos: VideoItem[]): Report {
  const categoryCounts = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<CategoryId, number>;
  const subtagCounts = Object.fromEntries(SUBTAG_ORDER.map((s) => [s, 0])) as Record<SubTagId, number>;
  let classified = 0;
  let errors = 0;
  let baitSum = 0;
  const buckets = { "Low (0-33)": 0, "Mid (34-66)": 0, "High (67-100)": 0 };

  for (const v of videos) {
    if (v.error) errors++;
    const c = v.classification;
    if (!c) continue;
    classified++;
    categoryCounts[c.category]++;
    for (const t of c.subtags)
      if (Object.prototype.hasOwnProperty.call(subtagCounts, t)) subtagCounts[t]++;
    baitSum += c.bait_score;
    if (c.bait_score <= 33) buckets["Low (0-33)"]++;
    else if (c.bait_score <= 66) buckets["Mid (34-66)"]++;
    else buckets["High (67-100)"]++;
  }

  // Largest-remainder rounding so the category percentages sum to exactly 100
  // (independent Math.round can drift to 99 or 101 and make the bar/legend lie).
  const categoryPct = largestRemainder(
    CATEGORY_ORDER.map((c) => categoryCounts[c]),
    classified
  ).reduce((acc, pct, idx) => {
    acc[CATEGORY_ORDER[idx]] = pct;
    return acc;
  }, {} as Record<CategoryId, number>);

  // Derive engineered as the complement of genuine so headline + genuine = 100.
  const engineeredPct = classified ? 100 - categoryPct.genuine : 0;

  return {
    total: videos.length,
    classified,
    errors,
    categoryCounts,
    categoryPct,
    subtagCounts,
    avgBait: classified ? Math.round(baitSum / classified) : 0,
    baitDistribution: Object.entries(buckets).map(([label, count]) => ({ label, count })),
    engineeredPct,
  };
}
