import type React from "react";
import { useState } from "react";
import type { Provider } from "../classify";
import { DEFAULT_MODELS, validateKey } from "../classify";
import { KeyHelp, Step } from "./KeyHelp";
import { signInWithGoogle, signOutGoogle, hasGoogleToken } from "../googleAuth";

export type SourceMode = "sample" | "trending" | "channel" | "playlist" | "subscriptions";

export interface SetupState {
  provider: Provider;
  aiKey: string;
  model: string;
  ytKey: string;
  region: string;
  count: number;
  source: SourceMode;
  channelInput: string;
  playlistInput: string;
  googleClientId: string;
  googleSignedIn: boolean;
}

const SOURCE_LABELS: Record<SourceMode, string> = {
  sample: "Sample",
  trending: "Trending",
  channel: "By channel",
  playlist: "Playlist / URLs",
  subscriptions: "My subscriptions",
};

const SOURCE_HINT: Record<SourceMode, string> = {
  sample: "Built-in example titles. No YouTube key needed. Great for a first look.",
  trending: "Today's most-popular videos for a region.",
  channel: "Paste a channel handle or URL to scan its recent uploads. Organic to what you watch.",
  playlist: "Paste a public playlist URL, or video links copied from your own homepage.",
  subscriptions:
    "Sign in with Google (read-only) to analyze the newest uploads from channels you subscribe to.",
};

// Which modes need the YouTube Data API key (subscriptions uses an OAuth token).
function needsYtKey(s: SourceMode): boolean {
  return s === "trending" || s === "channel" || s === "playlist";
}

export function SetupPanel({
  state,
  setState,
  onRun,
  running,
}: {
  state: SetupState;
  setState: React.Dispatch<React.SetStateAction<SetupState>>;
  onRun: () => void;
  running: boolean;
}) {
  const [keyMsg, setKeyMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [authMsg, setAuthMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Functional updater: composes correctly even when several upd() calls fire
  // in one event handler (avoids stale-closure clobbering during batched setState).
  function upd<K extends keyof SetupState>(k: K, val: SetupState[K]) {
    setState((prev) => ({ ...prev, [k]: val }));
  }

  async function checkKey() {
    setKeyMsg(await validateKey(state.provider, state.aiKey));
  }

  async function connectGoogle() {
    setAuthMsg(null);
    if (state.googleClientId.trim().length < 10) {
      setAuthMsg({ ok: false, msg: "Enter your Google OAuth Client ID first." });
      return;
    }
    setAuthBusy(true);
    try {
      await signInWithGoogle(state.googleClientId.trim());
      upd("googleSignedIn", true);
      setAuthMsg({ ok: true, msg: "Connected. Your token stays in this tab only." });
    } catch (e: any) {
      upd("googleSignedIn", false);
      setAuthMsg({ ok: false, msg: e?.message || "Sign-in failed." });
    } finally {
      setAuthBusy(false);
    }
  }

  function disconnectGoogle() {
    signOutGoogle();
    upd("googleSignedIn", false);
    setAuthMsg({ ok: true, msg: "Signed out and token revoked." });
  }

  // Per-mode readiness: every mode needs an AI key; sources differ on what else.
  const aiReady = state.aiKey.length > 8;
  let sourceReady = true;
  if (state.source === "channel") sourceReady = state.ytKey.length > 8 && state.channelInput.trim().length > 0;
  else if (state.source === "playlist") sourceReady = state.ytKey.length > 8 && state.playlistInput.trim().length > 0;
  else if (state.source === "trending") sourceReady = state.ytKey.length > 8;
  else if (state.source === "subscriptions") sourceReady = state.googleSignedIn && hasGoogleToken();
  const canRun = aiReady && sourceReady;

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
                // single atomic update so provider AND model change together
                setState((prev) => ({ ...prev, provider: p, model: DEFAULT_MODELS[p] }));
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

        {state.provider === "openai" ? (
          <KeyHelp summary="How do I get an OpenAI key? Is it safe?">
            <Step n={1}>
              Go to{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-ent hover:underline"
              >
                platform.openai.com/api-keys
              </a>{" "}
              and click <span className="text-zinc-200">Create new secret key</span>. Copy it (it starts with{" "}
              <code className="text-zinc-300">sk-</code>).
            </Step>
            <Step n={2}>
              Paste it above. Set a low monthly spend limit under{" "}
              <a
                href="https://platform.openai.com/settings/organization/limits"
                target="_blank"
                rel="noreferrer"
                className="text-ent hover:underline"
              >
                Billing &rarr; Limits
              </a>{" "}
              so a leaked key can never cost you much.
            </Step>
            <p className="text-[11px] text-genuine">
              Safe by design: your key lives only in this browser tab and is sent straight to OpenAI. It is never
              uploaded, logged, or seen by this site. Close the tab and it is gone.
            </p>
          </KeyHelp>
        ) : (
          <KeyHelp summary="How do I get a Claude (Anthropic) key? Is it safe?">
            <Step n={1}>
              Go to{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-ent hover:underline"
              >
                console.anthropic.com/settings/keys
              </a>{" "}
              and click <span className="text-zinc-200">Create Key</span>. Copy it (it starts with{" "}
              <code className="text-zinc-300">sk-ant-</code>).
            </Step>
            <Step n={2}>
              Paste it above. Set a spend limit under{" "}
              <a
                href="https://console.anthropic.com/settings/limits"
                target="_blank"
                rel="noreferrer"
                className="text-ent hover:underline"
              >
                Settings &rarr; Limits
              </a>{" "}
              to cap your exposure.
            </Step>
            <p className="text-[11px] text-genuine">
              Safe by design: your key lives only in this browser tab and is sent straight to Anthropic. It is never
              uploaded, logged, or seen by this site.
            </p>
          </KeyHelp>
        )}
      </div>

      {/* source */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Feed source</label>
        <div className="grid grid-cols-2 gap-2">
          {(["sample", "trending", "channel", "playlist", "subscriptions"] as SourceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => upd("source", m)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                m === "subscriptions" ? "col-span-2" : ""
              } ${
                state.source === m
                  ? "border-zinc-100 bg-panel2 text-white"
                  : "border-edge text-muted hover:text-zinc-200"
              }`}
            >
              {SOURCE_LABELS[m]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{SOURCE_HINT[state.source]}</p>
      </div>

      <SourceInputs state={state} upd={upd} connectGoogle={connectGoogle} disconnectGoogle={disconnectGoogle} authBusy={authBusy} authMsg={authMsg} />

      {needsYtKey(state.source) && (
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
            <KeyHelp summary="How do I create a YouTube key — and lock it down safely?">
              <Step n={1}>
                Sign in to{" "}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ent hover:underline"
                >
                  Google Cloud Console
                </a>{" "}
                and create a new project (a free personal Google account works best &mdash; work/Workspace accounts
                often block API keys).
              </Step>
              <Step n={2}>
                Enable the{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ent hover:underline"
                >
                  YouTube Data API v3
                </a>{" "}
                for that project.
              </Step>
              <Step n={3}>
                Go to{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ent hover:underline"
                >
                  Credentials
                </a>{" "}
                &rarr; <span className="text-zinc-200">Create credentials &rarr; API key</span>. Paste it above (it
                starts with <code className="text-zinc-300">AIza</code>). No OAuth or consent screen needed.
              </Step>
              <div className="rounded-md border border-conflict/30 bg-conflict/10 p-2.5">
                <p className="font-semibold text-zinc-100">Important &mdash; restrict your key before you reuse it</p>
                <p className="mt-1">
                  A YouTube API key has a free daily quota. If someone copies an unrestricted key, they can drain{" "}
                  <span className="text-zinc-200">your</span> quota. On the key&rsquo;s settings page:
                </p>
                <p className="mt-1.5">
                  &bull; <span className="text-zinc-200">Application restrictions</span> &rarr;{" "}
                  <span className="text-zinc-200">HTTP referrers</span>, and add only the site(s) you use it on (for
                  local testing add <code className="text-zinc-300">localhost/*</code>).
                </p>
                <p className="mt-1">
                  &bull; <span className="text-zinc-200">API restrictions</span> &rarr; restrict to{" "}
                  <span className="text-zinc-200">YouTube Data API v3</span> only.
                </p>
              </div>
              <p className="text-[11px] text-genuine">
                You stay in full control: this key lives only in your browser and calls YouTube directly. It is never
                sent to or stored by this site &mdash; your data stays in your hands.
              </p>
            </KeyHelp>
          </div>
          <div className="flex gap-2">
            {state.source === "trending" && (
              <div className="flex-1">
                <label className="mb-1 block text-[11px] text-muted">Region</label>
                <input
                  value={state.region}
                  onChange={(e) => upd("region", e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full rounded border border-edge bg-ink px-2 py-1.5 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
                />
              </div>
            )}
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

// ---------------------------------------------------------------------------
// Per-source inputs. Renders the right control(s) for the selected mode.
// ---------------------------------------------------------------------------
function SourceInputs({
  state,
  upd,
  connectGoogle,
  disconnectGoogle,
  authBusy,
  authMsg,
}: {
  state: SetupState;
  upd: <K extends keyof SetupState>(k: K, val: SetupState[K]) => void;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  authBusy: boolean;
  authMsg: { ok: boolean; msg: string } | null;
}) {
  if (state.source === "channel") {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Channel handle or URL
        </label>
        <input
          value={state.channelInput}
          onChange={(e) => upd("channelInput", e.target.value)}
          placeholder="@mkbhd  ·  youtube.com/@mkbhd  ·  channel URL"
          className="w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-400"
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Scans that channel's most recent uploads. A channel you actually watch makes the read personal to you.
        </p>
      </div>
    );
  }

  if (state.source === "playlist") {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Playlist URL, or pasted video links
        </label>
        <textarea
          value={state.playlistInput}
          onChange={(e) => upd("playlistInput", e.target.value)}
          rows={4}
          placeholder={"Paste a public playlist URL,\nor paste video links from your own homepage — one per line."}
          className="w-full resize-y rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-zinc-400"
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Tip: open your YouTube homepage, copy the links of videos it's serving you, and paste them here to read your
          real feed. Nothing you paste leaves your browser except the lookup call to YouTube.
        </p>
      </div>
    );
  }

  if (state.source === "subscriptions") {
    return (
      <div className="space-y-3 rounded-lg border border-edge bg-ink/50 p-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Google OAuth Client ID
          </label>
          <input
            value={state.googleClientId}
            onChange={(e) => upd("googleClientId", e.target.value.trim())}
            placeholder="1234567890-abc....apps.googleusercontent.com"
            spellCheck={false}
            disabled={state.googleSignedIn}
            className="w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-400 disabled:opacity-50"
          />
        </div>

        {state.googleSignedIn ? (
          <button
            onClick={disconnectGoogle}
            className="w-full rounded-lg border border-edge px-3 py-2 text-sm font-medium text-muted transition hover:text-zinc-200"
          >
            Sign out of Google
          </button>
        ) : (
          <button
            onClick={connectGoogle}
            disabled={authBusy}
            className="w-full rounded-lg border border-zinc-100 bg-panel2 px-3 py-2 text-sm font-semibold text-white transition hover:bg-panel disabled:opacity-50"
          >
            {authBusy ? "Opening Google…" : "Connect with Google (read-only)"}
          </button>
        )}

        {authMsg && (
          <p className={`text-[11px] ${authMsg.ok ? "text-genuine" : "text-conflict"}`}>{authMsg.msg}</p>
        )}

        <div className="rounded-md border border-genuine/30 bg-genuine/10 p-2.5 text-[11px] leading-relaxed text-genuine">
          This stays between you and Google. The sign-in grants <span className="font-semibold">read-only</span> access
          to your subscriptions, the token lives only in this tab and is gone when you close it, and none of it is ever
          sent to or stored by this site. It's optional — the other modes work without it. The code is open source, so
          you can verify every word of this.
        </div>

        <div className="rounded-md border border-ent/30 bg-ent/10 p-2.5 text-[11px] leading-relaxed text-zinc-300">
          New to Google Cloud? The full step-by-step walkthrough is on the{" "}
          <span className="font-semibold text-zinc-100">Setup guide</span> page (link in the header) — it covers every
          screen with screenshots-level detail.
        </div>

        <SubscriptionsHelp />
      </div>
    );
  }

  // sample & trending: no extra inputs here
  return null;
}

// ---------------------------------------------------------------------------
// Collapsible help for setting up the Google OAuth client for subscriptions.
// ---------------------------------------------------------------------------
function SubscriptionsHelp() {
  return (
    <KeyHelp summary="How do I set up the Google sign-in (one-time)?">
      <Step n={1}>
        In{" "}
        <a
          href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
          target="_blank"
          rel="noreferrer"
          className="text-ent hover:underline"
        >
          Google Cloud Console
        </a>
        , use the same project where you enabled the <span className="text-zinc-200">YouTube Data API v3</span> (a free
        personal Google account works best).
      </Step>
      <Step n={2}>
        Open{" "}
        <a
          href="https://console.cloud.google.com/apis/credentials/consent"
          target="_blank"
          rel="noreferrer"
          className="text-ent hover:underline"
        >
          OAuth consent screen
        </a>
        , choose <span className="text-zinc-200">External</span>, fill the basics, and add your own Google address under{" "}
        <span className="text-zinc-200">Test users</span> (so you can sign in while the app is unpublished).
      </Step>
      <Step n={3}>
        Open{" "}
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="text-ent hover:underline"
        >
          Credentials
        </a>{" "}
        &rarr; <span className="text-zinc-200">Create credentials &rarr; OAuth client ID &rarr; Web application</span>.
        Under <span className="text-zinc-200">Authorized JavaScript origins</span> add this site's address (and{" "}
        <code className="text-zinc-300">http://localhost:5174</code> for local testing). Copy the{" "}
        <span className="text-zinc-200">Client ID</span> and paste it above.
      </Step>
      <p className="text-[11px] text-genuine">
        Only an ID is needed here — no client secret, ever. The grant is read-only and revocable from your{" "}
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noreferrer"
          className="text-ent hover:underline"
        >
          Google account permissions
        </a>{" "}
        at any time.
      </p>
    </KeyHelp>
  );
}
