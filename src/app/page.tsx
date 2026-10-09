import Link from "next/link";
import { Mark } from "@/components/mark";
import { WaitlistForm } from "@/components/waitlist-form";

const problems = [
  { title: "Availability is scattered", body: "Dates live in chats, calendars, and memory, so nobody sees the whole picture." },
  { title: "The same question repeats", body: "\u201CWho's free Friday?\u201D gets asked five times before anyone agrees on a time." },
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
          <div>
            <p className="eyebrow">Personal AI coordination</p>
            <h1>Your AI, meeting your friends&apos; AI.</h1>
            <p className="lead">Oriel makes plans with the people you trust, and asks you before anything happens.</p>
            <div className="cta-row">
              <Link className="button button-primary" href="/join">
                Join the waitlist
              </Link>
              <Link className="button button-secondary" href="/how-it-works">
                See how it works
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <Mark size={320} animate />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Group planning is slow.</h2>
            <p className="lead">Availability is scattered, questions repeat, and decisions get lost in the scroll.</p>
          </div>
          <div className="grid grid-3">
            {problems.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Four steps, with you in control.</h2>
          </div>
          <ol className="steps">
            {steps.map((step, i) => (
              <li className="step" key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Trust is built in.</h2>
          </div>
          <ul className="trust-list">
            {trust.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container hero-grid">
          <div>
            <h2>Get early access.</h2>
            <p className="lead">Leave your email and we will invite groups in small batches.</p>
          </div>
          <div>
            <WaitlistForm compact />
          </div>
        </div>
      </section>
    </>
  );
}
