"use client";

import { useEffect, useRef } from "react";
import { Mark } from "./mark";

/**
 * Hero visual: an arch-shaped oriel window of glass with a live plan thread inside.
 * The frame draws itself on load, scope chips float around it, and an approval
 * checkpoint pulses at the bottom. Pointer tilt runs only for fine pointers, and all
 * motion is disabled under reduced motion, so touch devices get the composition at no extra cost.
 */
export function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canTilt =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt) return;

    let frame = 0;
    const setTilt = (rx: number, ry: number) => {
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    };
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt(-y * 10, x * 12);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      setTilt(0, 0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="hero-art" aria-hidden="true">
      <div className="aurora">
        <span className="aurora-blob aurora-blob--indigo" />
        <span className="aurora-blob aurora-blob--lilac" />
        <span className="aurora-blob aurora-blob--amber" />
      </div>

      <div className="oriel-tilt">
        <div className="oriel-float">
          <svg className="oriel-frame" viewBox="0 0 300 380">
            <path className="frame-arch" pathLength={1} d="M-9 390 V150 A159 159 0 0 1 309 150 V390" />
            <path className="frame-sill" d="M-22 390 H322" />
          </svg>

          <div className="oriel-glass">
            <header className="oriel-head">
              <Mark size={28} />
              <p className="oriel-title">Thursday dinner</p>
              <p className="oriel-sub">Sara · Ali · Zain</p>
            </header>

            <div className="oriel-thread">
              <p className="oriel-msg oriel-msg--you">Plan dinner this week.</p>
              <p className="oriel-msg">Sara and Ali are free Thursday evening.</p>
              <p className="oriel-msg">Proposed: Thursday, 8:00 pm.</p>
            </div>

            <div className="oriel-approval">
              <span className="oriel-approval-text">Awaiting your approval</span>
              <span className="oriel-approve">Approve</span>
            </div>

            <span className="oriel-sheen" />
          </div>
        </div>
      </div>

      <span className="chip chip--1">Availability only</span>
      <span className="chip chip--2">Plans, shared</span>
      <span className="chip chip--3 chip--amber">Approval required</span>
    </div>
  );
}
