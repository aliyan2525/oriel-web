"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { AnimatedBeam } from "@/components/magic/animated-beam";

function Node({ label, tone, nodeRef }: { label: string; tone: "plan" | "agent"; nodeRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={nodeRef}
      className={
        tone === "plan"
          ? "z-10 rounded-2xl bg-night px-5 py-3 font-semibold text-white shadow-lg"
          : "z-10 rounded-2xl border border-lilac bg-white px-5 py-3 font-semibold text-night shadow-sm"
      }
    >
      {label}
    </div>
  );
}

/**
 * How a plan moves between agents: each agent connects to the plan, and the plan waits for your
 * approval. Decorative (aria-hidden), since the steps below carry the same information in text.
 */
export function FlowDiagram() {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const you = useRef<HTMLDivElement>(null);
  const sara = useRef<HTMLDivElement>(null);
  const zain = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="relative mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl border border-lilac/70 bg-white/70 p-8 shadow-sm md:flex-row md:items-center md:justify-between md:p-12"
    >
      <div className="flex flex-col gap-6">
        <Node label="Your agent" tone="agent" nodeRef={you} />
      </div>
      <Node label="Thursday dinner" tone="plan" nodeRef={plan} />
      <div className="flex flex-col gap-6">
        <Node label="Sara's agent" tone="agent" nodeRef={sara} />
        <Node label="Zain's agent" tone="agent" nodeRef={zain} />
      </div>
      {!reduce && (
        <>
          <AnimatedBeam containerRef={container} fromRef={you} toRef={plan} duration={3.2} />
          <AnimatedBeam containerRef={container} fromRef={sara} toRef={plan} duration={3.2} delay={0.6} reverse />
          <AnimatedBeam containerRef={container} fromRef={zain} toRef={plan} duration={3.2} delay={1.2} reverse />
        </>
      )}
    </div>
  );
}
