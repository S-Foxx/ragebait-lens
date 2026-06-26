import type { VideoItem } from "./taxonomy";

// Live fetch from the official YouTube Data API v3. Title text only — no login,
// no screenshots, no OCR. Key stays in the browser like the AI keys.
export async function fetchTrending(apiKey: string, region: string, max: number): Promise<VideoItem[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", region);
  url.searchParams.set("maxResults", String(Math.min(max, 50)));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`YouTube ${res.status}: ${t.slice(0, 160)}`);
  }
  const data = await res.json();
  return (data.items || []).map((it: any): VideoItem => {
    const s = it.snippet || {};
    const thumbs = s.thumbnails || {};
    const thumb = thumbs.medium?.url || thumbs.high?.url || thumbs.default?.url || "";
    const views = it.statistics?.viewCount ? formatViews(Number(it.statistics.viewCount)) : undefined;
    return {
      id: it.id,
      title: s.title || "",
      channel: s.channelTitle || "",
      thumbnail: thumb,
      views,
      publishedAt: s.publishedAt,
      url: `https://www.youtube.com/watch?v=${it.id}`,
    };
  });
}

function formatViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M views";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K views";
  return n + " views";
}

// Realistic sample feed (titles in the style YouTube actually serves) so the
// experience works instantly without any key. These are illustrative, not real
// videos — thumbnails are generated locally.
const MOCK_TITLES: { title: string; channel: string; views: string }[] = [
  { title: "He Made $1,000,000 in 30 Days (Here's EXACTLY How)", channel: "Hustle Daily", views: "2.3M views" },
  { title: "The Economy Is About to COLLAPSE — Do This NOW", channel: "Macro Truth", views: "1.1M views" },
  { title: "Why Everyone Is LYING To You About AI", channel: "Tech Unfiltered", views: "880K views" },
  { title: "I Tried the Viral Workout for 30 Days", channel: "FitJourney", views: "640K views" },
  { title: "This Politician Just DESTROYED the Whole Room", channel: "Clash Clips", views: "3.4M views" },
  { title: "10 Jobs AI Will ERASE Before 2027 (Are You Safe?)", channel: "Future Shock", views: "1.9M views" },
  { title: "Relaxing Rain Sounds for Deep Sleep (10 Hours)", channel: "Calm Ambience", views: "5.2M views" },
  { title: "Nobody Is Talking About This Secret Investment", channel: "Wealth Vault", views: "720K views" },
  { title: "The TRUTH About Electric Cars They Don't Want Out", channel: "Drive Real", views: "1.4M views" },
  { title: "How to Learn Python — Full Beginner Course", channel: "Code With Ana", views: "410K views" },
  { title: "She Said WHAT?! Internet Reacts (Gone Wrong)", channel: "Drama Hub", views: "2.8M views" },
  { title: "Last Chance: This Deal Disappears at Midnight", channel: "Deal Alerts", views: "300K views" },
  { title: "My Honest Review of the New Budget Laptop", channel: "Plain Tech", views: "190K views" },
  { title: "The MOST DANGEROUS City in America (I Went There)", channel: "Edge Travel", views: "4.1M views" },
  { title: "Quiet Morning Coffee & Lofi Beats to Study", channel: "Soft Hours", views: "980K views" },
  { title: "Billionaire Reveals the ONE Habit That Made Him Rich", channel: "Mindset Pro", views: "1.6M views" },
  { title: "Scientists Discover Something STRANGE in the Ocean", channel: "Deep Curiosity", views: "2.0M views" },
  { title: "How We Rebuilt a Village Water System (Documentary)", channel: "Open Hands", views: "120K views" },
  { title: "You're Doing Mornings WRONG (Fix It in 5 Minutes)", channel: "Better Daily", views: "870K views" },
  { title: "Full Match Highlights — Title Decider", channel: "Sports Center", views: "3.0M views" },
];

export function mockFeed(count: number): VideoItem[] {
  const pick = MOCK_TITLES.slice(0, Math.min(count, MOCK_TITLES.length));
  return pick.map((m, i) => ({
    id: `mock-${i}`,
    title: m.title,
    channel: m.channel,
    views: m.views,
    thumbnail: gradientThumb(i, m.title),
    url: "#",
  }));
}

// Generate a deterministic gradient SVG data-URI as a stand-in thumbnail.
function gradientThumb(seed: number, title: string): string {
  const hues = [(seed * 47) % 360, (seed * 47 + 60) % 360];
  const initials = title.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
  <stop offset='0' stop-color='hsl(${hues[0]} 55% 32%)'/>
  <stop offset='1' stop-color='hsl(${hues[1]} 55% 18%)'/></linearGradient></defs>
  <rect width='320' height='180' fill='url(#g)'/>
  <text x='50%' y='52%' font-family='Inter,sans-serif' font-size='54' font-weight='800'
   fill='#ffffff' fill-opacity='0.85' text-anchor='middle' dominant-baseline='middle'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
