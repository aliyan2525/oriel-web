"use client";

import dynamic from "next/dynamic";

/*
 * Decorative effects load after the first paint. Each one reserves its space, so nothing shifts
 * when it arrives, and each is skipped entirely for visitors who ask for reduced motion.
 */

export const LazyAurora = dynamic(() => import("./aurora").then((m) => m.Aurora), { ssr: false });

export const LazyBorderBeam = dynamic(() => import("./magic/border-beam").then((m) => m.BorderBeam), { ssr: false });

export const LazyFlowDiagram = dynamic(() => import("./flow-diagram").then((m) => m.FlowDiagram), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="mx-auto h-[300px] max-w-3xl" />,
});
