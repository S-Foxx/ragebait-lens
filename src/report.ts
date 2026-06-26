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
    for (const t of c.subtags) if (t in subtagCounts) subtagCounts[t]++;
    baitSum += c.bait_score;
    if (c.bait_score <= 33) buckets["Low (0-33)"]++;
    else if (c.bait_score <= 66) buckets["Mid (34-66)"]++;
    else buckets["High (67-100)"]++;
  }

  const categoryPct = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, classified ? Math.round((categoryCounts[c] / classified) * 100) : 0])
  ) as Record<CategoryId, number>;

  const engineered = classified ? classified - categoryCounts.genuine : 0;
  const engineeredPct = classified ? Math.round((engineered / classified) * 100) : 0;

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
