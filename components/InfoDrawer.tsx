"use client";

import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Info } from "lucide-react";

const sections = [
  {
    title: "What is Mindshare Map?",
    body: "A synthetic demo that turns advisor meeting briefs into governed insight signals you can explore instantly."
  },
  {
    title: "Key features",
    body: "Force-directed brief network, compliance IQ scoring, redline tracking, supervisor heatmap, export-ready audit bundle, and adaptive micro-lessons."
  },
  {
    title: "How to use",
    body: "Filter by office, product, or risk. Hover nodes to scan scores, click to open the detailed drawer, assign training, or approve as a supervisor."
  },
  {
    title: "Why it matters",
    body: "Shows how structured advisor workflows and compliance telemetry can be visualized for recruiters and field leaders — without touching real data."
  }
];

export function InfoDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-navy-700"
      >
        <Info className="h-4 w-4" /> About Mindshare Map
      </button>

      <Transition show={open}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <Transition.Child
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                  <Dialog.Title className="text-xl font-semibold text-navy-700">Mindshare Map Overview</Dialog.Title>
                  <p className="text-sm text-slate-500">Synthetic Demo Data • Built to show how compliance telemetry can guide recruiter conversations.</p>
                  <div className="space-y-4 text-sm text-slate-600">
                    {sections.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-sm font-semibold text-navy-600">{section.title}</h3>
                        <p>{section.body}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
                  >
                    Got it
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
