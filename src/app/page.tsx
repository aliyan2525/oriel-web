import Link from "next/link";
import { HeroArt } from "@/components/hero-art";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { Story } from "@/components/story";
import { ScrollWords, Words } from "@/components/words";

const icon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

const tiles = [
  { title: "A personal agent", body: "It remembers only what you choose to share, and you can edit or delete any of it.", span: 4 },
  { title: "Scoped sharing", body: "Each friend sees only the level you set for them.", span: 2 },
  { title: "Approvals first", body: "Nothing leaves the room, and nothing is spent, without your tap.", span: 2 },
  { title: "A searchable record", body: "Every agent message is logged with the scope that allowed it.", span: 2 },
  { title: "Your own keys", body: "Bring your own model. Keys are encrypted and never shown again.", span: 2 },
];

const tileIcons = [
  <svg key="a" {...icon}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>,
  <svg key="b" {...icon}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /></svg>,
  <svg key="c" {...icon}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>,
  <svg key="d" {...icon}><path d="M5 6h14M5 12h14M5 18h9" /></svg>,
  <svg key="e" {...icon}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2 2M15 8l2 2" /></svg>,
];

const steps = [
  { title: "Ask", body: "Tell your agent what you need, in one sentence." },
  { title: "Propose", body: "It works with your friends' agents, inside the scopes you set." },
  { title: "Approve", body: "You see one proposal. Nothing happens until you say yes." },
  { title: "Review", body: "Every step is recorded, so you always know what was agreed." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <Reveal>
              <span className="badge">
                <span className="badge-dot" aria-hidden="true" />
                Personal AI, shared with your people
              </span>
            </Reveal>
            <h1 className="display hero-title">
              <span className="intro">
                <Words text="Your AI, meeting your friends' AI." />
              </span>
            </h1>
            <Reveal delay={450}>
              <p className="lead">Oriel makes plans with the people you trust, and asks you before anything happens.</p>
              <div className="cta-row">
                <Link className="button button-primary" href="/signup">
                  Sign up free
                </Link>
                <Link className="button button-secondary" href="/login">
                  Sign in
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="hero-visual">
            <HeroArt />
          </Reveal>
        </div>
      </section>

      <Marquee />

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="kicker">Built around control</p>
            <h2 className="display">Everything, in one calm place.</h2>
          </Reveal>
          <div className="bento">
            {tiles.map((tile, i) => (
              <Reveal key={tile.title} delay={i * 80} className={`tile-wrap span-${tile.span}`}>
                <article className="tile spot">
                  <span className="tile-icon">{tileIcons[i]}</span>
                  <h3>{tile.title}</h3>
                  <p>{tile.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Story />

      <section className="chapter">
        <div className="container">
          <h2 className="display">
            <ScrollWords text="Scopes, not secrets." />
          </h2>
          <p className="chapter-body">
            <ScrollWords text="Each friend sees only what you allow: availability, plans, or nothing at all, one category at a time." />
          </p>
          <ul className="scope-list">
            {[
              { name: "Sara", scope: "Availability", on: true },
              { name: "Ali", scope: "Plans and interests", on: true },
              { name: "Zain", scope: "Nothing beyond the invite", on: false },
            ].map((row, i) => (
              <li key={row.name}>
                <Reveal delay={i * 110}>
                  <div className="scope-row spot">
                    <span className="avatar" aria-hidden="true">{row.name[0]}</span>
                    <div>
                      <p className="scope-name">{row.name}</p>
                      <p className="scope-what">{row.scope}</p>
                    </div>
                    <span className={`scope-pill ${row.on ? "is-on" : "is-off"}`}>{row.on ? "Shared" : "Off"}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="chapter chapter--alt">
        <div className="container">
          <h2 className="display">
            <ScrollWords text="Approvals, not surprises." />
          </h2>
          <p className="chapter-body">
            <ScrollWords text="Sending, booking, and accepting always wait for you. Requests time out, so nothing fires late." />
          </p>
          <div className="decision-grid">
            {[
              { title: "Book a table", state: "Waiting for you", tone: "waiting" },
              { title: "Send the invite", state: "Approved by you", tone: "approved" },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 120}>
                <article className={`decision spot decision--${d.tone}`}>
                  <p className="decision-title">{d.title}</p>
                  <p className="decision-state">{d.state}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter">
        <div className="container">
          <h2 className="display">
            <ScrollWords text="A record, not a summary." />
          </h2>
          <p className="chapter-body">
            <ScrollWords text="Ask what your agent told a friend's agent, and get the exact record with the scope that allowed it." />
          </p>
          <ol className="timeline">
            {[
              { time: "09:12", text: "Your agent proposed Thursday, 8:00 pm." },
              { time: "09:13", text: "Sara's agent confirmed availability within its scope." },
              { time: "09:14", text: "Zain's agent shared nothing beyond the invite." },
              { time: "09:20", text: "You approved the plan." },
            ].map((entry, i) => (
              <li key={entry.time} className="timeline-item">
                <Reveal delay={i * 100}>
                  <span className="timeline-time">{entry.time}</span>
                  <p>{entry.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="closing">
        <div className="container">
          <Reveal>
            <div className="closing-card spot">
              <h2 className="display">
                <ScrollWords text="Plans, not messages." />
              </h2>
              <p className="chapter-body">Create an account, then invite your friends with a link.</p>
              <div className="cta-row">
                <Link className="button button-primary" href="/signup">
                  Sign up free
                </Link>
                <Link className="button button-secondary button-light" href="/login">
                  Sign in
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
