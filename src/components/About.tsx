import { Logo } from "./Logo";

// The About page: why this exists, why it's open source, and exactly how your
// data is handled. Written to be read by a non-technical person.
export function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-zinc-200"
      >
        <span aria-hidden>←</span> Back to the lens
      </button>

      <div className="mb-8 flex items-center gap-3">
        <Logo className="h-9 w-9 text-conflict" />
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">About Ragebait Lens</h1>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">Why this exists</h2>
          <p>
            Most of what gets served to us isn't chosen because it's true, useful, or good. It's chosen because it{" "}
            <span className="text-zinc-100">holds attention</span> — and the fastest way to hold attention is to provoke
            a reaction. Outrage, envy, fear of missing out, the promise of a secret everyone else is too foolish to see.
            We swim in this all day and stop noticing it.
          </p>
          <p className="mt-3">
            Ragebait Lens is a small instrument for noticing it again. It reads the{" "}
            <span className="text-zinc-100">title text</span> of real videos — never the video itself — and sorts each
            into the psychological lever it's built to pull: Wealth, Conflict, Entertainment, FOMO/Scarcity, and the
            rare one that just tells you what it is — <span className="text-genuine">Genuine</span>. Seeing a feed laid
            out this way makes the pattern impossible to un-see.
          </p>
          <p className="mt-3">
            It ends with one question, on purpose:{" "}
            <span className="text-zinc-100">how will you create your own content?</span> The honest, calm, genuinely
            useful thing tends to stay invisible unless someone seeks it out. That's the trap. Knowing it is the first
            step out of it — both as someone who watches and as someone who makes things.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">Why I open-sourced it</h2>
          <p>
            A tool that claims to show you the truth about manipulation has no business being a black box. Open source
            means you don't have to take my word for any of it — you can read every line and confirm exactly what it
            does and doesn't do.
          </p>
          <p className="mt-3">
            It also means the idea outlives me. Anyone can fork it, improve the categories, point it at other kinds of
            feeds, or fold the lens into their own projects. If it helps even a few people consume — and create — a
            little more deliberately, that's worth far more than keeping it locked up. The source lives at{" "}
            <a
              href="https://github.com/S-Foxx/ragebait-lens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ent underline decoration-edge underline-offset-2 hover:text-zinc-100"
            >
              github.com/S-Foxx/ragebait-lens
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">Your data stays yours</h2>
          <p>
            This is the part that matters most, so it's worth being precise. There is{" "}
            <span className="text-zinc-100">no server</span> behind this site. It's a static page that runs entirely in
            your browser.
          </p>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="text-genuine" aria-hidden>
                •
              </span>
              <span>
                Your API keys live only in this browser tab. They are sent straight from your device to OpenAI,
                Anthropic, or YouTube — never to this site, and never stored.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-genuine" aria-hidden>
                •
              </span>
              <span>
                If you connect Google to read your subscriptions, that's a{" "}
                <span className="text-zinc-100">read-only</span> handshake between you and Google. The access token stays
                in memory for this tab only and disappears when you close it. I never see it, and you can revoke it any
                time from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ent underline decoration-edge underline-offset-2 hover:text-zinc-100"
                >
                  Google account permissions
                </a>
                .
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-genuine" aria-hidden>
                •
              </span>
              <span>
                Connecting Google is entirely optional. The sample, channel, and playlist modes give you the full
                experience without signing in to anything beyond your own AI key.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-genuine" aria-hidden>
                •
              </span>
              <span>None of this is in my hands. It's between you, your AI provider, and Google — and it's auditable.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">How it reads a feed</h2>
          <p>
            Pick a source on the main page — a built-in sample, today's trending list, a single channel you watch, a
            playlist or pasted video links, or your own subscriptions. Ragebait Lens fetches just the titles and asks
            your chosen AI model to classify each one. It scores how engineered each title is and shows you the
            breakdown. No video is ever watched or downloaded; only the title text is read.
          </p>
          <p className="mt-3">
            The subscriptions mode needs a one-time Google sign-in setup. If the console feels intimidating, the{" "}
            <span className="text-zinc-100">Setup guide</span> (link in the header) walks you through every screen in
            plain language. And once you have a result, you can share the{" "}
            <span className="text-zinc-100">verdict</span> as an image — numbers only, never your actual feed, since
            what gets served to you is nobody else's business.
          </p>
        </section>

        <section className="border-t border-edge pt-8">
          <h2 className="mb-2 text-lg font-bold text-zinc-100">Part of a bigger conversation: Our Plain Sight</h2>
          <p>
            I write a newsletter called <span className="text-zinc-100">Our Plain Sight</span> about the quiet machinery
            behind disconnection — how attention gets engineered, how outrage gets manufactured, how the gap between
            “us” and “them” widens by design — and the small, human countermeasures that put choice back where it belongs:
            with us. Ragebait Lens is one of those countermeasures, made into something you can actually hold.
          </p>
          <p className="mt-3">
            The whole practice comes down to one word — <span className="text-zinc-100">why?</span> Why does this content
            exist? Why am I the target for it? Who benefits from my reaction? It’s a pause, not a cure. This tool just
            makes that pause a little easier to take.
          </p>
          <p className="mt-3">
            If that resonates, come join the discussion — everyone’s welcome, whatever you believe or wherever you come
            from. You can read it at{" "}
            <a
              href="https://ourplainsight.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ent underline decoration-edge underline-offset-2 hover:text-zinc-100"
            >
              ourplainsight.substack.com
            </a>{" "}
            or follow along at{" "}
            <a
              href="https://substack.com/@ourplainsight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ent underline decoration-edge underline-offset-2 hover:text-zinc-100"
            >
              @ourplainsight
            </a>
            . Reply to anything I send — I read all of it.
          </p>
        </section>

        <p className="border-t border-edge pt-6 text-[12px] text-muted">
          Built by Sabir Foux. MIT licensed. The lens is a mirror, not a verdict — use it to think, not to judge.
        </p>
      </div>
    </div>
  );
}
