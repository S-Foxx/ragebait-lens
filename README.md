# Ragebait Lens

**See the hook before you click.**

![Ragebait Lens analyzing a feed](docs/screenshot.png)

Ragebait Lens reads the **title text** of real trending YouTube videos and sorts each
into the psychological category it's engineered to exploit — then shows you the math on
how little of your feed is actually honest.

> **One question, no other ask:** *How will you create your own content?*

**[Live demo](https://ragebait-lens.vercel.app)** · static site · client-side BYOK · open source

It is a static, single-page app. **There is no server.** Your AI key and your YouTube
key never leave your browser — classification requests go straight from your device to
OpenAI / Anthropic. That is the only design in which "zero-knowledge on the host's part"
is literally true. Don't trust the claim — read `src/classify.ts`.

## The taxonomy

Each video is placed in **exactly one** category (mutually exclusive):

| Category          | What it exploits                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Conflict**      | Aggression, fear, mistrust, us-vs-them, outrage, ragebait                 |
| **Wealth**        | Money, power, status, influence, advantage over others                   |
| **FOMO / Scarcity** | Urgency, secrecy, "before it's too late", "nobody is talking about this" |
| **Entertainment** | Fun or informative but inert — you can't act on it                       |
| **Genuine**       | Honestly titled, no engineered hook. The unicorn — usually near-empty.    |

Plus non-exclusive **sub-tags** (the mechanisms layered into a title): clickbait,
curiosity gap, negativity bias, authority bait, parasocial, outrage, scarcity, superlative.

Each video also gets a **0–100 bait score** and a **one-sentence rationale** pointing at
the specific words in the title — so the classification is auditable, not a black box.
The model only reads title + channel text. It never watches the video and is instructed
not to invent content. That is what keeps the report non-hallucinated.

## Why "Genuine" is kept even though it's almost always empty

It's the punchline. Watching it sit at 2–4% while Conflict + Wealth + FOMO dominate is the
whole point: the algorithm doesn't reward honesty, it rewards the hook. Honest videos stay
invisible unless someone explicitly searches for them.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL. Pick a provider, paste your OpenAI (`sk-...`) or Anthropic
(`sk-ant-...`) key, and click **Analyze the feed**. Start with the built-in **Sample feed**
(no YouTube key needed) to see how it works.

For **Live YouTube**, get a free [YouTube Data API v3 key](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
and paste it in. It fetches `mostPopular` videos by region — title text only, no login,
no screenshots, no OCR.

## Deploy

Static build, deploys anywhere. For Vercel: framework = Vite, build = `npm run build`,
output = `dist`. A `vercel.json` is included.

## Security notes (read these)

- Keys live only in React state (in memory) for the session. They are **not** written to
  `localStorage`, cookies, or any server.
- Because calls happen client-side, the keys are exposed to the page's JavaScript — so a
  tampered copy of this site *could* exfiltrate them. The defense is that this is
  open-source and auditable. Run it locally or from a deployment you trust, and use a
  scoped/limited key.
- The YouTube key is sent to Google's API from the browser; restrict it to the YouTube
  Data API and (ideally) your domain in the Google Cloud console.

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). The non-negotiables: never commit
secrets, keep it client-side, and read title text only.

## License

[MIT](LICENSE) — do what you want, just keep the notice.
