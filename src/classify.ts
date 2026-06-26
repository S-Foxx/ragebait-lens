// CLIENT-SIDE classifier. The user's API key NEVER leaves their browser:
// requests go straight from the browser to OpenAI / Anthropic. There is no
// server in this app. This is the only design where "zero-knowledge on the
// host's part" is literally true.

import type { Classification, SubTagId, VideoItem } from "./taxonomy";
import { SUBTAGS } from "./taxonomy";

const VALID_CATEGORIES = ["wealth", "conflict", "entertainment", "fomo", "genuine"] as const;

export type Provider = "openai" | "anthropic";

const SYSTEM_PROMPT = `You are a precise classifier of YouTube engagement-bait. You ONLY read the title and channel name as text — you do NOT watch the video or guess hidden facts. You never invent content. If the text is too thin to judge, lean toward "entertainment" with a low bait_score.

Assign EXACTLY ONE category (mutually exclusive):
- "wealth": advertises money, power, status, influence, getting rich/ahead, or advantage over others.
- "conflict": promotes aggression, fear, mistrust, us-vs-them, outrage, drama, or ragebait.
- "fomo": urgency, secrecy, scarcity — "before it's too late", "nobody is talking about", "you're missing out", "limited".
- "entertainment": fun or informative but inert — the viewer cannot act on it (music, clips, sports, trivia, gameplay).
- "genuine": honestly titled, no engineered hook, promotes real understanding, peace, growth, or help. This is rare; reserve it.

Also assign ZERO OR MORE sub-tags (non-exclusive psychological mechanisms present in the TEXT):
"clickbait", "curiosity_gap", "negativity_bias", "authority_bait", "parasocial", "outrage", "scarcity", "superlative".

bait_score (0-100): how engineered the title is to force a click. Plain, descriptive titles score low (0-25). Curiosity-gap, ALL-CAPS, superlatives, manufactured drama score high (70-100).

rationale: ONE short sentence pointing at the specific words/pattern in the title. No speculation about the actual video.

Return ONLY strict JSON, no markdown:
{"category": "...", "subtags": ["..."], "bait_score": 0, "rationale": "..."}`;

function buildUserPrompt(title: string, channel: string): string {
  return `Title: ${title}\nChannel: ${channel}\n\nClassify this single video. JSON only.`;
}

function parseResult(raw: string): Classification {
  let txt = raw.trim();
  // strip code fences if a model adds them
  const fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) txt = fence[1].trim();

  // Guarded parse: malformed / truncated model output must not error the whole
  // video — fall back to a low-confidence, honest "couldn't classify" result.
  let obj: any;
  try {
    obj = JSON.parse(txt);
  } catch {
    return {
      category: "entertainment",
      subtags: [],
      bait_score: 0,
      rationale: "Model returned unparseable output; not classified.",
    };
  }

  const category = (VALID_CATEGORIES as readonly string[]).includes(obj?.category)
    ? (obj.category as Classification["category"])
    : "entertainment";

  // Validate subtags against the known set, drop unknowns, and de-duplicate so
  // downstream counting and React keys stay sound.
  const rawTags: unknown[] = Array.isArray(obj?.subtags) ? obj.subtags : [];
  const subtags = Array.from(
    new Set(
      rawTags.filter(
        (t): t is SubTagId =>
          typeof t === "string" && Object.prototype.hasOwnProperty.call(SUBTAGS, t)
      )
    )
  ).slice(0, 6);

  let score = Number(obj?.bait_score);
  if (!Number.isFinite(score)) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category,
    subtags,
    bait_score: score,
    rationale: String(obj?.rationale || "").slice(0, 240),
  };
}

async function callOpenAI(key: string, model: string, title: string, channel: string): Promise<Classification> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(title, channel) },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 160)}`);
  }
  const data = await res.json();
  return parseResult(data.choices?.[0]?.message?.content ?? "");
}

async function callAnthropic(key: string, model: string, title: string, channel: string): Promise<Classification> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      // allow calls straight from the browser
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(title, channel) }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Anthropic ${res.status}: ${t.slice(0, 160)}`);
  }
  const data = await res.json();
  const text = Array.isArray(data.content) ? data.content.map((c: any) => c.text || "").join("") : "";
  return parseResult(text);
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
};

export async function classifyOne(
  provider: Provider,
  key: string,
  model: string,
  v: VideoItem
): Promise<Classification> {
  if (provider === "openai") return callOpenAI(key, model, v.title, v.channel);
  return callAnthropic(key, model, v.title, v.channel);
}

// Run with bounded concurrency so a feed of 40 doesn't hammer rate limits.
export async function classifyFeed(
  provider: Provider,
  key: string,
  model: string,
  videos: VideoItem[],
  concurrency: number,
  onProgress: (v: VideoItem) => void
): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < videos.length) {
      const idx = i++;
      const v = videos[idx];
      try {
        v.classification = await classifyOne(provider, key, model, v);
        v.error = undefined;
      } catch (e: any) {
        v.error = e?.message || "classification failed";
      }
      onProgress(v);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, videos.length) }, worker);
  await Promise.all(workers);
}

// A cheap, non-AI key sanity check (no network) before we let the user run.
export async function validateKey(provider: Provider, key: string): Promise<{ ok: boolean; msg: string }> {
  if (!key || key.length < 9) return { ok: false, msg: "That key looks too short." };
  if (provider === "openai" && !key.startsWith("sk-")) return { ok: false, msg: "OpenAI keys start with 'sk-'." };
  if (provider === "anthropic" && !key.startsWith("sk-ant-"))
    return { ok: false, msg: "Anthropic keys start with 'sk-ant-'." };
  return { ok: true, msg: "Looks valid." };
}
