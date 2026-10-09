import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { HeroArt } from "@/components/hero-art";
import { WaitlistForm } from "@/components/waitlist-form";

const problems = [
  { title: "Availability is scattered", body: "Dates live in chats, calendars, and memory, so nobody sees the whole picture." },
  { title: "The same question repeats", body: "Who's free Friday? gets asked five times before anyone agrees on a time." },
  { title: "Decisions get lost", body: "Nobody remembers who agreed to what, or why the plan changed." },
];

const steps = [
  { title: "Ask", body: "Tell your agent what you need, such as a dinner this week." },
  { title: "Propose", body: "Your agent and your friends' agents work within the limits each person has set." },
  { title: "Approve", body: "You get one clear proposal. Nothing is booked until you tap approve." },
  { title: "Review", body: "Every message and decision is in your activity log, searchable any time." },
];

const trust = [
  "Nothing is shared without a scope you set.",
  "Nothing is booked without your approval.",
  "Everything your agent does is in your log.",
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <Reveal>
            <p className="eyebrow">Personal AI coordination</p>
            <h1>Your AI, meeting your friends&apos; AI.</h1>
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
          <Reveal delay={150} className="hero-visual">
            <HeroArt />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Group planning is slow.</h2>
              <p className="lead">Availability is scattered, questions repeat, and decisions get lost in the scroll.</p>
            </div>
          </Reveal>
          <div className="grid grid-3">
            {problems.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <article className="card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split">
          <Reveal>
            <h2>A real plan, in one thread.</h2>
            <p className="lead">Your agent talks to your friends' agents, shows you one proposal, and waits for your approval.</p>
            <div className="cta-row">
              <Link className="button button-secondary" href="/how-it-works">
                See how it works
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="chat" aria-label="Illustrative example of a plan thread">
              <div className="chat-msg chat-msg--you">Plan dinner this week with Sara, Ali, and Zain.</div>
              <div className="chat-msg">
                <small>Your agent</small>
                Sara and Ali are free Thursday evening. Zain's availability is pending.
              </div>
              <div className="chat-msg">
                <small>Your agent</small>
                Proposed: Thursday, 8:00 pm, near campus.
              </div>
              <div className="chat-approval">
                <p>Awaiting your approval</p>
                <div className="pill-row" aria-hidden="true">
                  <span className="pill pill--yes">Approve</span>
                  <span className="pill pill--no">Change</span>
                </div>
              </div>
            </div>
            <p className="caption">Illustrative example.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Four steps, with you in control.</h2>
            </div>
          </Reveal>
          <ol className="steps">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <li className="step">
                  <span className="step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2>Trust is built in.</h2>
            </div>
          </Reveal>
          <ul className="trust-list">
            {trust.map((line, i) => (
              <Reveal key={line} delay={i * 90}>
                <li>{line}</li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container hero-grid">
          <Reveal>
            <h2>Get early access.</h2>
            <p className="lead">Leave your email and we will invite groups in small batches.</p>
          </Reveal>
          <Reveal delay={120}>
            <WaitlistForm compact />
          </Reveal>
        </div>
      </section>
    </>
  );
}
