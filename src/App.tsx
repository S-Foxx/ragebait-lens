import { useMemo, useState } from "react";
import { classifyFeed } from "./classify";
import type { Provider } from "./classify";
import {
  fetchTrending,
  fetchByChannel,
  fetchPlaylist,
  fetchVideosByIds,
  fetchSubscriptions,
  parsePlaylistInput,
  parseVideoIds,
  mockFeed,
} from "./youtube";
import { getGoogleToken } from "./googleAuth";
import { buildReport } from "./report";
import type { CategoryId, VideoItem } from "./taxonomy";
import { CATEGORIES } from "./taxonomy";
import { VideoCard } from "./components/VideoCard";
import { ReportPanel } from "./components/ReportPanel";
import { SetupPanel } from "./components/SetupPanel";
import type { SetupState } from "./components/SetupPanel";
import { Logo } from "./components/Logo";
import { About } from "./components/About";
import { SetupGuide } from "./components/SetupGuide";
import { VerdictShare } from "./components/VerdictShare";

export default function App() {
  const [setup, setSetup] = useState<SetupState>({
    provider: "openai" as Provider,
    aiKey: "",
    model: "gpt-4o-mini",
    ytKey: "",
    region: "US",
    count: 24,
    source: "sample",
    channelInput: "",
    playlistInput: "",
    googleClientId: "",
    googleSignedIn: false,
  });
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [view, setView] = useState<"lens" | "about" | "guide">("lens");

  const report = useMemo(() => buildReport(videos), [videos]);
  // Show results/report once we have a feed AND at least one attempt resolved
  // (a classification OR an error). This way an all-errored run still surfaces
  // the report panel with its error count instead of silently hiding it.
  const hasResults = videos.length > 0 && videos.some((v) => v.classification || v.error);

  async function run() {
    setFatal(null);
    setRunning(true);
    setDone(0);
    setFilter(null);
    // clear any prior run's cards up front, so a failed fetch doesn't leave
    // stale results next to the new error banner
    setVideos([]);
    try {
      const feed = await fetchFeed(setup);
      if (!feed.length) throw new Error("No videos returned from the source.");
      setVideos(feed.map((v) => ({ ...v })));

      let completed = 0;
      await classifyFeed(setup.provider, setup.aiKey, setup.model, feed, 4, () => {
        completed++;
        setDone(completed);
        setVideos(feed.map((v) => ({ ...v })));
      });

      // If every video failed, surface a single clear explanation at the top.
      const errs = feed.filter((v) => v.error).length;
      if (errs > 0 && errs === feed.length) {
        setFatal(
          `All ${errs} classifications failed — your ${
            setup.provider === "openai" ? "OpenAI" : "Anthropic"
          } key may be invalid, out of quota, or rate-limited. See a card below for the exact error.`
        );
      }
    } catch (e: any) {
      setFatal(e?.message || "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* header */}
      <header className="sticky top-0 z-20 border-b border-edge bg-ink/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7 text-conflict" />
            <div>
              <div className="text-sm font-extrabold tracking-tight text-zinc-100">Ragebait Lens</div>
              <div className="text-[10px] uppercase tracking-widest text-muted">see the hook before you click</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {running && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2 w-2 animate-pulse rounded-full bg-conflict" />
                analyzing {done}/{videos.length}
              </div>
            )}
            <button
              onClick={() => setView(view === "lens" ? "guide" : "lens")}
              className={`text-xs font-medium transition ${
                view === "guide" ? "text-zinc-100" : "text-muted hover:text-zinc-200"
              }`}
            >
              {view === "guide" ? "The lens" : "Setup guide"}
            </button>
            <button
              onClick={() => setView(view === "about" ? "lens" : "about")}
              className={`text-xs font-medium transition ${
                view === "about" ? "text-zinc-100" : "text-muted hover:text-zinc-200"
              }`}
            >
              {view === "about" ? "The lens" : "About"}
            </button>
          </div>
        </div>
      </header>

      {view === "about" && <About onBack={() => setView("lens")} />}
      {view === "guide" && <SetupGuide onBack={() => setView("lens")} />}

      {view === "lens" && (
      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {/* intro */}
        {!hasResults && !running && (
          <section className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-balance text-2xl font-extrabold leading-tight text-zinc-100 sm:text-3xl">
              Almost everything in your feed is engineered to make you click.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Ragebait Lens reads the <span className="text-zinc-200">title text</span> of real trending videos and
              sorts each into the psychological category it's built to exploit — Wealth, Conflict, FOMO, Entertainment —
              and the rare honest one: <span className="text-genuine">Genuine</span>. Videos that don't bait you are
              mostly invisible unless you search for them. This shows you the math.
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          {/* left rail */}
          <aside className="space-y-6 lg:sticky lg:top-[68px] lg:self-start">
            <SetupPanel state={setup} setState={setSetup} onRun={run} running={running} />
            {fatal && (
              <div className="rounded-lg border border-conflict/40 bg-conflict/10 p-3 text-xs text-conflict">
                {fatal}
              </div>
            )}
            {hasResults && <ReportPanel report={report} activeFilter={filter} onFilter={setFilter} />}
          </aside>

          {/* feed */}
          <section>
            {videos.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {filter && (
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <span className="text-muted">Showing only</span>
                    <span className="font-semibold" style={{ color: CATEGORIES[filter].hex }}>
                      {CATEGORIES[filter].label}
                    </span>
                    <span className="text-muted">— other videos dimmed below.</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {videos.map((v) => (
                    <VideoCard
                      key={v.id}
                      v={v}
                      dim={!!filter && v.classification?.category !== filter}
                    />
                  ))}
                </div>

                {/* Shareable verdict image — numbers only, never the feed */}
                {hasResults && !running && <VerdictShare report={report} />}

                {/* CTA — the one and only */}
                {hasResults && !running && (
                  <CtaBlock report={report} />
                )}
              </>
            )}
          </section>
        </div>
      </main>
      )}

      <footer className="border-t border-edge px-4 py-6 text-center text-[11px] text-muted">
        <p>Reads title text only · no video is watched · your keys stay in your browser.</p>
        <p className="mt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setView("about")}
            className="font-medium text-zinc-300 underline decoration-edge underline-offset-2 transition-colors hover:text-zinc-100"
          >
            About this project &amp; your privacy
          </button>
          <span className="text-edge">·</span>
          <button
            onClick={() => setView("guide")}
            className="font-medium text-zinc-300 underline decoration-edge underline-offset-2 transition-colors hover:text-zinc-100"
          >
            Google Cloud setup guide
          </button>
        </p>
        <p className="mt-2">
          <a
            href="https://github.com/S-Foxx/ragebait-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-zinc-300 underline decoration-edge underline-offset-2 transition-colors hover:text-zinc-100"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

// Dispatch the feed fetch based on the selected source mode. Keeping this out
// of run() keeps the component lean and makes each mode's contract explicit.
async function fetchFeed(s: SetupState): Promise<VideoItem[]> {
  switch (s.source) {
    case "sample":
      return mockFeed(s.count);
    case "trending":
      return fetchTrending(s.ytKey, s.region, s.count);
    case "channel":
      return fetchByChannel(s.ytKey, s.channelInput, s.count);
    case "playlist": {
      // A playlist URL/ID takes precedence; otherwise treat the box as pasted links.
      const playlistId = parsePlaylistInput(s.playlistInput);
      if (playlistId) return fetchPlaylist(s.ytKey, playlistId, s.count);
      const ids = parseVideoIds(s.playlistInput);
      return fetchVideosByIds(s.ytKey, ids, s.count);
    }
    case "subscriptions": {
      const token = getGoogleToken();
      if (!token) throw new Error("Connect with Google first to read your subscriptions.");
      return fetchSubscriptions(token, s.ytKey || undefined, s.count);
    }
    default:
      return mockFeed(s.count);
  }
}

function EmptyState() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-edge text-center">
      <Logo className="mb-4 h-12 w-12 text-edge" />
      <p className="text-sm text-muted">Add your AI key and hit “Analyze the feed.”</p>
      <p className="mt-1 max-w-xs text-xs text-muted/70">
        Start with the sample feed — no YouTube key needed — to see how it works.
      </p>
    </div>
  );
}

function CtaBlock({ report }: { report: { engineeredPct: number } }) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-edge bg-gradient-to-br from-panel to-ink p-8 text-center">
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-widest text-muted">
          {report.engineeredPct}% of this feed was built to hook you
        </p>
        <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight text-zinc-100">
          How will you create your own content?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The algorithm doesn't reward honesty — it rewards the hook. If you make something true and calm, it stays
          invisible unless people seek it out. That's the trap. Knowing it is the first move out of it.
        </p>
      </div>
    </div>
  );
}
