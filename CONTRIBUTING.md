# Contributing to Ragebait Lens

Thanks for considering a contribution. This project exists to make engagement-bait
visible — keep that spirit: clarity over cleverness, honesty over hype.

## Ground rules

- **Never commit secrets.** No API keys, tokens, or `.env` files. The whole point of this
  project is that keys live only in the user's browser. Anything key-shaped in a PR will be
  rejected.
- **Title text only.** The classifier reads titles and channel names. Don't add features
  that watch videos, OCR thumbnails, or invent content the model can't see — that breaks the
  "non-hallucinated" promise.
- **No server.** This is a static, client-side app by design. Don't introduce a backend
  that proxies user keys.

## Getting set up

```bash
npm install
npm run dev
```

Use the built-in **Sample feed** (no keys needed) for most development.

## Project layout

| File                        | Responsibility                                              |
| --------------------------- | ---------------------------------------------------------- |
| `src/taxonomy.ts`           | Categories, sub-tags, types — the conceptual core           |
| `src/classify.ts`           | Client-side OpenAI/Anthropic calls + the classifier prompt  |
| `src/youtube.ts`            | YouTube Data API fetch + the sample feed                    |
| `src/report.ts`             | Aggregation math for the report                             |
| `src/components/`           | UI (cards, badges, report panel, setup panel)              |
| `src/App.tsx`               | Orchestration and layout                                    |

## Good first contributions

- Tune the classifier prompt in `src/classify.ts` for fewer mis-categorizations.
- Add or refine a sub-tag in `src/taxonomy.ts` (and the prompt).
- Improve accessibility (focus states, ARIA, keyboard nav).
- Add localization for non-English feeds.

## Before you open a PR

```bash
npm run build   # must pass with no type errors
```

Describe what you changed and why. Screenshots help for any UI change.
