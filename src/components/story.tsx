"use client";

import { useRef, useState } from "react";
import { StoryWindow, type StoryStep } from "./story-window";
import { useScrollProgress } from "./use-scroll-progress";
import { Words } from "./words";

const STEPS: { key: StoryStep; title: string; body: string }[] = [
  { key: "ask", title: "Ask", body: "Tell your agent what you need, in one sentence." },
  { key: "propose", title: "Propose", body: "It works with your friends' agents, inside the scopes you set." },
  { key: "approve", title: "Approve", body: "You see one proposal. Nothing happens until you say yes." },
  { key: "review", title: "Review", body: "Every step is recorded, so you always know what was agreed." },
];

/**
 * A pinned, scroll-driven story. The section's scroll position moves the narrative:
 * the sentence fills word by word, the active step changes, and the window redraws to match.
 * Without JavaScript the first step is shown, and the sticky layout still works in CSS.
 */
export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useScrollProgress({
    measure: sectionRef,
    write: sectionRef,
    mode: "pin",
    onChange: (p) => setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))),
  });

  return (
    <section ref={sectionRef} className="story" aria-label="How Oriel works">
      <div className="story-stage">
        <span className="story-progress" aria-hidden="true" />
        <StoryWindow step={STEPS[active].key} />
        <div className="story-copy">
          <p className="story-lead">
            <Words text="Plans shouldn't take twenty messages. Your agent can coordinate them, and it asks before anything happens." />
          </p>
          <ol className="story-steps">
            {STEPS.map((step, i) => (
              <li key={step.key} data-active={i === active}>
                <span className="story-num" aria-hidden="true">
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
      </div>
    </section>
  );
}
