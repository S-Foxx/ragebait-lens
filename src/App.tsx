import { useMemo, useState } from "react";
import { classifyFeed } from "./classify";
import type { Provider } from "./classify";
import { fetchTrending, mockFeed } from "./youtube";
import { buildReport } from "./report";
import type { CategoryId, VideoItem } from "./taxonomy";
import { CATEGORIES } from "./taxonomy";
import { VideoCard } from "./components/VideoCard";
import { ReportPanel } from "./components/ReportPanel";
import { SetupPanel } from "./components/SetupPanel";
import type { SetupState } from "./components/SetupPanel";
import { Logo } from "./components/Logo";

export default function App() {
  const [setup, setSetup] = useState<SetupState>({
    provider: "openai" as Provider,
    aiKey: "",
    model: "gpt-4o-mini",
    ytKey: "",
    region: "US",
    count: 24,
    useMock: true,
  });
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

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
      const feed = setup.useMock
        ? mockFeed(setup.count)
        : await fetchTrending(setup.ytKey, setup.region, setup.count);
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
          {running && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-conflict" />
              analyzing {done}/{videos.length}
            </div>
          )}
        </div>
      </header>

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

                {/* CTA — the one and only */}
                {hasResults && !running && (
                  <CtaBlock report={report} />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-edge px-4 py-6 text-center text-[11px] text-muted">
        Reads title text only · no video is watched · your keys stay in your browser · open source.
      </footer>
    </div>
  );
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
