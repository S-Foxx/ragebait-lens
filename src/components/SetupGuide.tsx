import { Logo } from "./Logo";
import type { ReactNode } from "react";

// A long, friendly, screenshot-accurate walkthrough of everything you need to
// do in Google Cloud Console to use the optional "My subscriptions" feature.
// Written for someone who has never opened the console before.

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ent underline decoration-edge underline-offset-2 hover:text-zinc-100"
    >
      {children}
    </a>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-[13px] text-zinc-200">{children}</code>;
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="relative pl-12">
      <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-panel2 font-mono text-sm font-bold text-zinc-200 ring-1 ring-edge">
        {n}
      </span>
      <h3 className="mb-1.5 text-base font-bold text-zinc-100">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-300">{children}</div>
    </li>
  );
}

function Note({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: ReactNode }) {
  const map = {
    info: "border-edge bg-panel2/60 text-zinc-300",
    warn: "border-conflict/30 bg-conflict/10 text-zinc-200",
    good: "border-genuine/30 bg-genuine/10 text-genuine",
  } as const;
  return <div className={`mt-3 rounded-lg border p-3 text-[13px] leading-relaxed ${map[tone]}`}>{children}</div>;
}

export function SetupGuide({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-zinc-200"
      >
        <span aria-hidden>←</span> Back to the lens
      </button>

      <div className="mb-4 flex items-center gap-3">
        <Logo className="h-9 w-9 text-conflict" />
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Google Cloud setup guide</h1>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-muted">
        Google Cloud Console can look intimidating the first time, but you only touch a handful of screens. Follow this
        once and you'll have everything Ragebait Lens needs. Take it slow — every step below matches a real screen in
        the console. Nothing here is sent to this site; you're configuring{" "}
        <span className="text-zinc-300">your own</span> Google project.
      </p>

      {/* What you'll end up with */}
      <div className="mb-10 rounded-xl border border-edge bg-panel p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted">What you'll walk away with</div>
        <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
          <li>
            • An <span className="text-zinc-100">API key</span> (for Trending, By channel, and Playlist modes)
          </li>
          <li>
            • An <span className="text-zinc-100">OAuth 2.0 Client ID</span> (for the My subscriptions mode)
          </li>
          <li>• Both restricted and stored safely on your own computer</li>
        </ul>
        <Note tone="good">
          Prefer not to do any of this? That's completely fine. Sample, Trending, By channel, and Playlist modes give
          you the full experience. Only My subscriptions needs the OAuth Client ID below — and it's optional.
        </Note>
      </div>

      <ol className="space-y-9">
        <Step n={1} title="Sign in and open APIs & Services">
          <p>
            Go to <ExtLink href="https://console.cloud.google.com/">console.cloud.google.com</ExtLink> and sign in with
            your <span className="text-zinc-100">personal</span> Google account (a free personal account works best —
            work/Workspace accounts often block API keys).
          </p>
          <p>
            From the dashboard's <span className="text-zinc-100">Quick access</span> tiles, click{" "}
            <span className="text-zinc-100">APIs &amp; Services</span>.
          </p>
        </Step>

        <Step n={2} title="Create a project (if you don't have one)">
          <p>
            If this is your first time, Google will prompt you to create a project. Click{" "}
            <span className="text-zinc-100">Create project</span>, give it any name (for example{" "}
            <Code>Ragebait Lens</Code>), and create it. If you already have a project, just make sure it's selected in
            the picker at the top of the page.
          </p>
        </Step>

        <Step n={3} title="Enable the YouTube Data API v3 first">
          <p>
            Before you can make an API key useful, the API itself has to be turned on for your project. In the left
            sidebar click <span className="text-zinc-100">Library</span>, search for{" "}
            <span className="text-zinc-100">YouTube Data API v3</span>, open it, and click{" "}
            <span className="text-zinc-100">Enable</span>.
          </p>
          <p>
            Shortcut:{" "}
            <ExtLink href="https://console.cloud.google.com/apis/library/youtube.googleapis.com">
              open YouTube Data API v3 directly
            </ExtLink>{" "}
            and hit Enable.
          </p>
          <Note tone="warn">
            Do this <span className="font-semibold">before</span> the next step. If the API isn't enabled, it won't show
            up in the key's restriction dropdown later.
          </Note>
        </Step>

        <Step n={4} title="Create your API key">
          <p>
            In the left sidebar click <span className="text-zinc-100">Credentials</span>, then{" "}
            <span className="text-zinc-100">+ Create credentials → API key</span>. Google generates a key that starts
            with <Code>AIza…</Code>. Don't close the dialog yet — click{" "}
            <span className="text-zinc-100">Edit API key</span> (or open the key from the list) to lock it down in the
            next step.
          </p>
        </Step>

        <Step n={5} title="Restrict the API key (important)">
          <p>On the key's settings page, set two restrictions:</p>
          <p>
            <span className="text-zinc-100">API restrictions</span> → choose{" "}
            <span className="text-zinc-100">Restrict key</span>, open the dropdown, and select{" "}
            <span className="text-zinc-100">YouTube Data API v3</span> (this is why we enabled it first). It should then
            read “Selected APIs: YouTube Data API v3”.
          </p>
          <p>
            <span className="text-zinc-100">Application restrictions</span> → choose{" "}
            <span className="text-zinc-100">Websites</span>, then under{" "}
            <span className="text-zinc-100">Website restrictions</span> click <span className="text-zinc-100">Add</span>{" "}
            and add these two, one at a time:
          </p>
          <div className="rounded-lg border border-edge bg-ink p-3 font-mono text-[13px] leading-relaxed text-zinc-200">
            http://localhost:5174/*
            <br />
            https://ragebait-lens.vercel.app/*
          </div>
          <p>
            Click <span className="text-zinc-100">Save</span>.
          </p>
          <Note tone="warn">
            If you leave Website restrictions blank, your key will accept requests from any site. A YouTube key has a
            free daily quota — if someone copies an unrestricted key, they can drain <span className="font-semibold">your</span>{" "}
            quota. The two entries above lock it to this app only. (Running the site somewhere else? Add that address
            too.)
          </Note>
        </Step>

        <Step n={6} title="Create the OAuth 2.0 Client ID">
          <p>
            Back on the <span className="text-zinc-100">Credentials</span> screen, click{" "}
            <span className="text-zinc-100">+ Create credentials → OAuth client ID</span>. Choose application type{" "}
            <span className="text-zinc-100">Web application</span> and give it any name (for example{" "}
            <Code>Ragebait Lens</Code> — this name is only for you).
          </p>
          <p>
            Under <span className="text-zinc-100">Authorized JavaScript origins</span>, click{" "}
            <span className="text-zinc-100">+ Add URI</span> and add these two (note: no <Code>/*</Code> here — origins
            are just the bare address):
          </p>
          <div className="rounded-lg border border-edge bg-ink p-3 font-mono text-[13px] leading-relaxed text-zinc-200">
            https://ragebait-lens.vercel.app
            <br />
            http://localhost:5174
          </div>
          <p>
            You can leave <span className="text-zinc-100">Authorized redirect URIs</span> empty — this app uses
            browser-only sign-in, so no redirect URL is needed. Click <span className="text-zinc-100">Save</span>.
          </p>
          <Note tone="info">
            Settings can take anywhere from 5 minutes to a few hours to take effect, so if sign-in doesn't work
            immediately, give it a little time.
          </Note>
        </Step>

        <Step n={7} title="Copy and store your credentials safely">
          <p>
            Open the OAuth client you just made and copy both the <span className="text-zinc-100">Client ID</span> and{" "}
            <span className="text-zinc-100">Client secret</span>. Paste them into a plain text or document file and save
            it somewhere safe on your own computer.
          </p>
          <Note tone="warn">
            Store these <span className="font-semibold">locally</span>, not in the cloud (not in a public note, shared
            drive, or chat). You are responsible for keeping these credentials secure and for managing the settings in
            your Google Cloud Console. Ragebait Lens never sees or stores them.
          </Note>
          <Note tone="info">
            Heads up: Ragebait Lens only needs the <span className="font-semibold">Client ID</span> to sign you in —
            never the client secret. The secret is something Google gives you for server-side use; keep it private and
            don't paste it into any website (including this one).
          </Note>
        </Step>

        <Step n={8} title="Set up Branding">
          <p>
            In the left sidebar open the OAuth / <span className="text-zinc-100">Google Auth Platform</span> area and go
            to <span className="text-zinc-100">Branding</span>. Give the app a name, set{" "}
            <span className="text-zinc-100">User support email</span> to <span className="text-zinc-100">your</span>{" "}
            Google email, and set <span className="text-zinc-100">Developer contact / Developer support email</span> to
            that same email of yours.
          </p>
          <Note tone="warn">Use your own email for both — not the project author's. This is your project.</Note>
          <p>
            Still on Branding, find <span className="text-zinc-100">Authorized domains</span>, click{" "}
            <span className="text-zinc-100">Add Domain</span>, and add:
          </p>
          <div className="rounded-lg border border-edge bg-ink p-3 font-mono text-[13px] leading-relaxed text-zinc-200">
            ragebait-lens.vercel.app
          </div>
        </Step>

        <Step n={9} title="Add yourself as a test user (Audience)">
          <p>
            Go to <span className="text-zinc-100">Audience</span>. While the app's publishing status is{" "}
            <span className="text-zinc-100">Testing</span>, only people you list as test users can sign in. Under{" "}
            <span className="text-zinc-100">Test users</span>, click <span className="text-zinc-100">+ Add users</span>{" "}
            and add your own Google email address.
          </p>
          <Note tone="info">
            You do <span className="font-semibold">not</span> need to click “Publish app.” Testing mode is exactly right
            for personal use — leave it as is.
          </Note>
        </Step>

        <Step n={10} title="Connect it in Ragebait Lens">
          <p>
            Back in the app, choose the <span className="text-zinc-100">My subscriptions</span> source, paste your{" "}
            <span className="text-zinc-100">Client ID</span>, and click{" "}
            <span className="text-zinc-100">Connect with Google</span>. Sign in with the same account you added as a test
            user. That's it — the newest uploads from your subscriptions will load for analysis.
          </p>
        </Step>
      </ol>

      {/* The unverified-app warning explanation */}
      <section className="mt-12 rounded-xl border border-conflict/30 bg-conflict/10 p-5">
        <h2 className="text-lg font-bold text-zinc-100">“Google hasn't verified this app” — this is normal</h2>
        <div className="mt-2 space-y-3 text-sm leading-relaxed text-zinc-300">
          <p>
            When you connect, Google will show a screen warning that the app isn't verified, usually with an{" "}
            <span className="text-zinc-100">Advanced → Go to (app) (unsafe)</span> link. That warning is expected, and
            here's exactly why:
          </p>
          <p>
            Ragebait Lens is an <span className="text-zinc-100">open-source, auditable tech demo</span> built to show how
            your social feed on YouTube is shaped. It is not a commercial product. It will not be sold, listed on any
            app store, or pushed to the general public — so it hasn't gone through Google's formal verification review
            (which is meant for apps distributed at scale). Because you created the project yourself, added your own
            email as a test user, and requested only <span className="text-zinc-100">read-only</span> access, you are
            granting access to <span className="text-zinc-100">your own</span> project. The warning is Google being
            cautious about unverified apps in general, not a sign that anything is wrong here.
          </p>
          <p>
            Don't want to take that on faith? You shouldn't have to. You can read the full source, have an AI agent walk
            through it, hire a paid consultant to review it, or inspect it with your own experience — it's freely
            available to the public at{" "}
            <ExtLink href="https://github.com/S-Foxx/ragebait-lens">github.com/S-Foxx/ragebait-lens</ExtLink>.
          </p>
          <p className="text-genuine">
            And remember: connecting Google is optional. You can still get real value from the Sample, Trending, By
            channel, and Playlist modes without ever signing in.
          </p>
        </div>
      </section>

      {/* Liability / good-faith disclaimer */}
      <section className="mt-8 rounded-xl border border-edge bg-panel p-5">
        <h2 className="text-base font-bold text-zinc-100">Disclaimer &amp; good-faith notice</h2>
        <div className="mt-2 space-y-3 text-[13px] leading-relaxed text-muted">
          <p>
            Ragebait Lens is free, open-source software provided in good faith, “as is,” without warranty of any kind,
            express or implied — including but not limited to merchantability, fitness for a particular purpose, and
            non-infringement. To the fullest extent permitted by law, the author (Sabir Foux) is not liable for any
            claim, damages, loss, or other liability arising from the use of, or inability to use, this software — see
            the <ExtLink href="https://github.com/S-Foxx/ragebait-lens/blob/main/LICENSE">MIT License</ExtLink> for the
            full terms.
          </p>
          <p>
            You are solely responsible for your own API keys and OAuth credentials, for the configuration and security
            of your Google Cloud project, for any costs or quota usage on your accounts, and for using this tool in
            compliance with the terms of service of Google/YouTube, OpenAI, and Anthropic. Classifications are generated
            by third-party AI models and are interpretive, not authoritative — treat the verdict as a lens for
            reflection, not a definitive judgment.
          </p>
          <p>
            This project exists to encourage more thoughtful consumption — and creation — of online content. It is
            shared openly so you never have to simply trust it: verify it.
          </p>
        </div>
      </section>

      <p className="mt-8 text-center text-[12px] text-muted">
        Built by Sabir Foux. MIT licensed. Questions or improvements?{" "}
        <ExtLink href="https://github.com/S-Foxx/ragebait-lens">Open the repo</ExtLink>.
      </p>
    </div>
  );
}
