"use client";

import { useEffect, useState } from "react";

const steps = [
  {
    title: "Filters",
    body: "Dial in synthetic data by office, product, and compliance IQ."
  },
  {
    title: "Force Graph",
    body: "Explore how briefs cluster by topic, office, or product. Click a node for detail."
  },
  {
    title: "Detail Drawer",
    body: "See compliance IQ, coverage bars, redlines, and assign micro-lessons."
  },
  {
    title: "Supervisor View",
    body: "Toggle supervisor mode to unlock the heatmap, escalations, and approvals."
  }
];

export function GuidedTour() {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    const seen = typeof window !== "undefined" ? window.sessionStorage.getItem("mindshare-tour") : "seen";
    if (!seen) {
      setActiveIndex(0);
      window.sessionStorage.setItem("mindshare-tour", "seen");
    }
  }, []);

  if (activeIndex === -1) return null;
  const step = steps[activeIndex];

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-4 md:items-center">
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Step {activeIndex + 1} of {steps.length}</p>
        <h3 className="mt-2 text-lg font-semibold text-navy-700">{step.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{step.body}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex(-1)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1 < steps.length ? prev + 1 : -1))}
            className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
          >
            {activeIndex + 1 === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
