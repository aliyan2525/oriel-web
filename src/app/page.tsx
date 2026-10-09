import Link from "next/link";
import { HeroArt } from "@/components/hero-art";
import { Reveal } from "@/components/reveal";
import { Story } from "@/components/story";
import { ScrollWords, Words } from "@/components/words";
import { WaitlistForm } from "@/components/waitlist-form";

const scopes = [
  { name: "Sara", scope: "Availability", on: true },
  { name: "Ali", scope: "Plans and interests", on: true },
  { name: "Zain", scope: "Nothing beyond the invite", on: false },
];

const decisions = [
  { title: "Book a table", state: "Waiting for you", tone: "waiting" },
  { title: "Send the invite", state: "Approved by you", tone: "approved" },
];

const record = [
  { time: "09:12", text: "Your agent proposed Thursday, 8:00 pm." },
  { time: "09:13", text: "Sara's agent confirmed availability within its scope." },
  { time: "09:14", text: "Zain's agent shared nothing beyond the invite." },
  { time: "09:20", text: "You approved the plan." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Personal AI coordination</p>
            <h1 className="display">
              <span className="intro">
                <Words text="Your AI, meeting your friends' AI." />
              </span>
            </h1>
            <Reveal delay={450}>
              <p className="lead">Oriel makes plans with the people you trust, and asks you before anything happens.</p>
              <div className="cta-row">
                <Link className="button button-primary" href="/join">
                  Join the waitlist
                </Link>
                <Link className="button button-secondary" href="/features">
                  Explore features
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="hero-visual">
            <HeroArt />
          </Reveal>
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
            {scopes.map((row, i) => (
              <li key={row.name}>
                <Reveal delay={i * 110}>
                  <div className="scope-row">
                    <span className="avatar" aria-hidden="true">
                      {row.name[0]}
                    </span>
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
            {decisions.map((d, i) => (
              <Reveal key={d.title} delay={i * 120}>
                <article className={`decision decision--${d.tone}`}>
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
            {record.map((entry, i) => (
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
        <div className="container closing-inner">
          <h2 className="display">
            <ScrollWords text="Plans, not messages." />
          </h2>
          <Reveal delay={120}>
            <p className="chapter-body">Join the waitlist, and we will invite groups in small batches.</p>
            <WaitlistForm compact />
          </Reveal>
        </div>
      </section>
    </>
  );
}
