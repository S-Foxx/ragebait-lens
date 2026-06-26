import { useState } from "react";
import type { Provider } from "../classify";
import { DEFAULT_MODELS, validateKey } from "../classify";

export interface SetupState {
  provider: Provider;
  aiKey: string;
  model: string;
  ytKey: string;
  region: string;
  count: number;
  useMock: boolean;
}

export function SetupPanel({
  state,
  setState,
  onRun,
  running,
}: {
  state: SetupState;
  setState: (s: SetupState) => void;
  onRun: () => void;
  running: boolean;
}) {
  const [keyMsg, setKeyMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  function upd<K extends keyof SetupState>(k: K, val: SetupState[K]) {
    setState({ ...state, [k]: val });
  }

  async function checkKey() {
    setKeyMsg(await validateKey(state.provider, state.aiKey));
  }

  const canRun = state.useMock ? state.aiKey.length > 8 : state.aiKey.length > 8 && state.ytKey.length > 8;

  return (
    <div className="space-y-5 rounded-2xl bg-panel p-5 ring-1 ring-edge">
      {/* zero-knowledge note */}
      <div className="rounded-lg border border-genuine/30 bg-genuine/10 p-3 text-[11px] leading-relaxed text-genuine">
        <span className="font-semibold">Your keys never leave this browser.</span> There is no server. Classification
        calls go straight from your device to {state.provider === "openai" ? "OpenAI" : "Anthropic"}. Nothing is stored
        or transmitted to the host. Open-source — inspect it yourself.
      </div>

      {/* provider */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">AI provider</label>
        <div className="grid grid-cols-2 gap-2">
          {(["openai", "anthropic"] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                upd("provider", p);
                upd("model", DEFAULT_MODELS[p]);
                setKeyMsg(null);
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                state.provider === p
                  ? "border-zinc-100 bg-panel2 text-white"
                  : "border-edge text-muted hover:text-zinc-200"
              }`}
            >
              {p === "openai" ? "OpenAI" : "Anthropic (Claude)"}
            </button>
          ))}
        </div>
      </div>

      {/* ai key */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {state.provider === "openai" ? "OpenAI" : "Anthropic"} API key
        </label>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={state.aiKey}
          onChange={(e) => {
            upd("aiKey", e.target.value.trim());
            setKeyMsg(null);
          }}
          onBlur={checkKey}
          placeholder={state.provider === "openai" ? "sk-..." : "sk-ant-..."}
          className="w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <input
            value={state.model}
            onChange={(e) => upd("model", e.target.value)}
            className="w-40 rounded border border-edge bg-ink px-2 py-1 font-mono text-[11px] text-muted outline-none focus:border-zinc-400"
          />
          {keyMsg && (
            <span className={`text-[11px] ${keyMsg.ok ? "text-genuine" : "text-conflict"}`}>{keyMsg.msg}</span>
          )}
        </div>
      </div>

      {/* source */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Video source</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => upd("useMock", true)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              state.useMock ? "border-zinc-100 bg-panel2 text-white" : "border-edge text-muted hover:text-zinc-200"
            }`}
          >
            Sample feed
          </button>
          <button
            onClick={() => upd("useMock", false)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              !state.useMock ? "border-zinc-100 bg-panel2 text-white" : "border-edge text-muted hover:text-zinc-200"
            }`}
          >
            Live YouTube
          </button>
        </div>
      </div>

      {!state.useMock && (
        <div className="space-y-3 rounded-lg border border-edge bg-ink/50 p-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              YouTube Data API key
            </label>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={state.ytKey}
              onChange={(e) => upd("ytKey", e.target.value.trim())}
              placeholder="AIza..."
              className="w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
            />
            <a
              href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-[11px] text-ent hover:underline"
            >
              Get a free YouTube API key →
            </a>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-muted">Region</label>
              <input
                value={state.region}
                onChange={(e) => upd("region", e.target.value.toUpperCase().slice(0, 2))}
                className="w-full rounded border border-edge bg-ink px-2 py-1.5 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-muted">Count (max 50)</label>
              <input
                type="number"
                min={5}
                max={50}
                value={state.count}
                onChange={(e) => upd("count", Math.max(5, Math.min(50, Number(e.target.value) || 24)))}
                className="w-full rounded border border-edge bg-ink px-2 py-1.5 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        </div>
      )}

      <button
        disabled={!canRun || running}
        onClick={onRun}
        className="w-full rounded-lg bg-zinc-100 py-2.5 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {running ? "Analyzing feed…" : "Analyze the feed"}
      </button>
    </div>
  );
}
