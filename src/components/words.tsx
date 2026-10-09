"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import { useScrollProgress } from "./use-scroll-progress";

/**
 * Splits text into word spans. Each word's opacity follows --p from an ancestor,
 * so one scroll value can light up a whole sentence word by word.
 * Screen readers get the full sentence once; the spans are hidden from assistive tech.
 */
export function Words({ text }: { text: string }) {
  const parts = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {parts.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="w" style={{ "--i": i, "--n": parts.length } as CSSProperties}>
              {word}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** A sentence whose words light up as it scrolls into view. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useScrollProgress({ measure: ref, write: ref, mode: "reveal" });
  return (
    <span ref={ref} className={`words ${className}`.trim()}>
      <Words text={text} />
    </span>
  );
}
