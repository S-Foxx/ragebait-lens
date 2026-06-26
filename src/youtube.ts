import type { VideoItem } from "./taxonomy";

const API = "https://www.googleapis.com/youtube/v3";

// ---- shared helpers -------------------------------------------------------

async function ytGet(path: string, params: Record<string, string>, auth: { key?: string; token?: string }) {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (auth.key) url.searchParams.set("key", auth.key);
  const headers: Record<string, string> = {};
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`YouTube ${res.status}: ${t.slice(0, 180)}`);
  }
  return res.json();
}

function snippetToVideo(it: any): VideoItem | null {
  const s = it.snippet || {};
  // videos.list → it.id is a string; search/playlistItems nest the id differently
  const id =
    typeof it.id === "string"
      ? it.id
      : it.id?.videoId || s.resourceId?.videoId || it.contentDetails?.videoId;
  if (!id) return null;
  const thumbs = s.thumbnails || {};
  const thumb = thumbs.medium?.url || thumbs.high?.url || thumbs.default?.url || "";
  const views = it.statistics?.viewCount ? formatViews(Number(it.statistics.viewCount)) : undefined;
  return {
    id,
    title: s.title || "",
    channel: s.videoOwnerChannelTitle || s.channelTitle || "",
    thumbnail: thumb,
    views,
    publishedAt: s.publishedAt,
    url: `https://www.youtube.com/watch?v=${id}`,
  };
}

// Parse a raw user input that could be: a channel handle (@name), a channel URL,
// a /channel/UC... URL, a /user/ legacy URL, or a bare custom name.
export function parseChannelInput(raw: string): { type: "id" | "handle" | "search"; value: string } {
  const v = raw.trim();
  const idMatch = v.match(/channel\/(UC[\w-]{20,})/) || v.match(/^(UC[\w-]{20,})$/);
  if (idMatch) return { type: "id", value: idMatch[1] };
  const handleUrl = v.match(/youtube\.com\/@([\w.\-]+)/);
  if (handleUrl) return { type: "handle", value: handleUrl[1] };
  if (v.startsWith("@")) return { type: "handle", value: v.slice(1) };
  const userUrl = v.match(/youtube\.com\/user\/([\w.\-]+)/) || v.match(/youtube\.com\/c\/([\w.\-]+)/);
  if (userUrl) return { type: "search", value: userUrl[1] };
  return { type: "search", value: v };
}

// Extract a playlist id (PL..., UU..., FL..., LL...) from a URL or bare id.
export function parsePlaylistInput(raw: string): string | null {
  const v = raw.trim();
  const m = v.match(/[?&]list=([\w-]+)/) || v.match(/^((?:PL|UU|FL|LL|OL)[\w-]+)$/);
  return m ? m[1] : null;
}

// Pull video ids out of a blob of pasted watch URLs / shorts / bare ids.
export function parseVideoIds(raw: string): string[] {
  const ids = new Set<string>();
  const re = /(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})|\b([\w-]{11})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const id = m[1] || m[2];
    if (id && id.length === 11) ids.add(id);
  }
  return [...ids];
}

// Live fetch from the official YouTube Data API v3. Title text only — no login,
// no screenshots, no OCR. Key stays in the browser like the AI keys.
export async function fetchTrending(apiKey: string, region: string, max: number): Promise<VideoItem[]> {
  const data = await ytGet(
    "videos",
    {
      part: "snippet,statistics",
      chart: "mostPopular",
      regionCode: region,
      maxResults: String(Math.min(max, 50)),
    },
    { key: apiKey }
  );
  return (data.items || []).map(snippetToVideo).filter(Boolean) as VideoItem[];
}

// ---- By channel -----------------------------------------------------------

// Resolve a channel handle/URL/name to its "uploads" playlist id, then list it.
export async function fetchByChannel(apiKey: string, input: string, max: number): Promise<VideoItem[]> {
  const parsed = parseChannelInput(input);
  let channelId: string | undefined;

  if (parsed.type === "id") {
    channelId = parsed.value;
  } else if (parsed.type === "handle") {
    const r = await ytGet("channels", { part: "contentDetails", forHandle: parsed.value }, { key: apiKey });
    channelId = r.items?.[0]?.id;
  }
  // Fallback (custom/legacy name, or handle lookup miss): search for the channel.
  if (!channelId) {
    const s = await ytGet(
      "search",
      { part: "snippet", type: "channel", q: parsed.value, maxResults: "1" },
      { key: apiKey }
    );
    channelId = s.items?.[0]?.snippet?.channelId || s.items?.[0]?.id?.channelId;
  }
  if (!channelId) throw new Error(`Could not find a channel for "${input}".`);

  const ch = await ytGet("channels", { part: "contentDetails", id: channelId }, { key: apiKey });
  const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("That channel has no public uploads playlist.");
  return fetchPlaylist(apiKey, uploads, max);
}

// ---- Playlist -------------------------------------------------------------

export async function fetchPlaylist(apiKey: string, playlistOrUrl: string, max: number): Promise<VideoItem[]> {
  const playlistId = parsePlaylistInput(playlistOrUrl) || playlistOrUrl.trim();
  const data = await ytGet(
    "playlistItems",
    { part: "snippet,contentDetails", playlistId, maxResults: String(Math.min(max, 50)) },
    { key: apiKey }
  );
  return (data.items || []).map(snippetToVideo).filter(Boolean) as VideoItem[];
}

// ---- Specific video ids (pasted URLs) -------------------------------------

export async function fetchVideosByIds(apiKey: string, ids: string[], max: number): Promise<VideoItem[]> {
  const slice = ids.slice(0, Math.min(max, 50));
  if (!slice.length) throw new Error("No valid video links found in that input.");
  const data = await ytGet(
    "videos",
    { part: "snippet,statistics", id: slice.join(",") },
    { key: apiKey }
  );
  return (data.items || []).map(snippetToVideo).filter(Boolean) as VideoItem[];
}

// ---- My subscriptions (OAuth) ---------------------------------------------

// Uses an OAuth access token (read-only). Pulls the user's subscriptions, then
// the most recent upload from each, newest first. No API key needed when a
// token is present, but key is accepted as a quota fallback.
export async function fetchSubscriptions(
  token: string,
  apiKey: string | undefined,
  max: number
): Promise<VideoItem[]> {
  const auth = { token, key: apiKey || undefined };
  // 1. up to 50 subscriptions (alphabetical — a representative slice of the feed)
  const subs = await ytGet(
    "subscriptions",
    { part: "snippet", mine: "true", maxResults: "50", order: "relevance" },
    auth
  );
  const channelIds: string[] = (subs.items || [])
    .map((it: any) => it.snippet?.resourceId?.channelId)
    .filter(Boolean);
  if (!channelIds.length) throw new Error("No subscriptions found on this account.");

  // 2. resolve uploads playlists in batches of 50
  const ch = await ytGet("channels", { part: "contentDetails", id: channelIds.slice(0, 50).join(",") }, auth);
  const uploads: string[] = (ch.items || [])
    .map((c: any) => c.contentDetails?.relatedPlaylists?.uploads)
    .filter(Boolean);

  // 3. take the latest upload from each channel, then sort newest-first & cap
  const perChannel = await Promise.all(
    uploads.map(async (pl) => {
      try {
        const d = await ytGet("playlistItems", { part: "snippet,contentDetails", playlistId: pl, maxResults: "1" }, auth);
        return (d.items || []).map(snippetToVideo).filter(Boolean) as VideoItem[];
      } catch {
        return [];
      }
    })
  );
  const all = perChannel.flat();
  all.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  return all.slice(0, max);
}

function formatViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M views";
  // round to K first so 999,999 rolls up to "1M" rather than "1000K"
  if (n >= 1e3) {
    const k = Math.round(n / 1e3);
    if (k >= 1000) return (k / 1e3).toFixed(1).replace(/\.0$/, "") + "M views";
    return k + "K views";
  }
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
