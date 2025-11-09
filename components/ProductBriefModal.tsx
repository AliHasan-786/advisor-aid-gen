"use client";

import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FileText } from "lucide-react";

const pillars = [
  {
    title: "Who it serves",
    points: [
      "Recruiters showcase governed AI workflows without requesting production data.",
      "Supervisors see compliance telemetry, redlines, and coaching loops in one view.",
      "Advisors experience adaptive brief creation with micro-lesson nudges."
    ]
  },
  {
    title: "Business impact",
    points: [
      "Reduces interview explanation time by illustrating compliance IQ and analytics at a glance.",
      "Highlights AI governance guardrails that align with financial-services expectations.",
      "Demonstrates product thinking from insight ingestion through supervisor escalation."
    ]
  },
  {
    title: "Roadmap next steps",
    points: [
      "Integrate KPI dashboards that track micro-lesson completion to IQ lift.",
      "Expose lightweight task handoffs (e.g., send redlines to engineering / compliance).",
      "Add persona walk-throughs and story-driven scenarios for recruiter presentations."
    ]
  }
];

const backlog = [
  {
    heading: "Immediate",
    items: [
      "PDF share-out summarizing demo learnings + stakeholder talking points.",
      "Scenario toggles (virtual vs. in-person, advisor tenure) to compare outcomes.",
      "Owner assignment for escalations to show cross-functional workflow readiness."
    ]
  },
  {
    heading: "Near-term",
    items: [
      "Add Insights tab with trend charts and cohort analytics.",
      "Build stubbed API endpoints to demonstrate integration touchpoints.",
      "Record product walkthrough video embedded in the info drawer."
    ]
  },
  {
    heading: "Aspirational",
    items: [
      "Plug into sandbox CRM data for live pilots.",
      "Incorporate Volunteer for Good / social impact tagging to mirror NYL culture.",
      "Surface ROI calculator estimating supervisor time saved and compliance uplift."
    ]
  }
];

export function ProductBriefModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-navy-400"
      >
        <FileText className="h-4 w-4" /> Product Brief
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
                <Dialog.Panel className="w-full max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow-2xl">
                  <Dialog.Title className="text-xl font-semibold text-navy-700">Mindshare Map — Product Narrative</Dialog.Title>
                  <p className="text-sm text-slate-500">
                    Built as a synthetic, governed demo to illustrate how a Technical Product Manager can orchestrate AI, compliance, and enablement workflows for recruiters and field leaders.
                  </p>

                  <div className="grid gap-4 md:grid-cols-3">
                    {pillars.map((pillar) => (
                      <div key={pillar.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-navy-700">{pillar.title}</h3>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {pillar.points.map((point) => (
                            <li key={point}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-navy-700">Roadmap Outlook</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {backlog.map((lane) => (
                        <div key={lane.heading} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{lane.heading}</h4>
                          <ul className="mt-2 space-y-2 text-sm text-slate-600">
                            {lane.items.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <h3 className="text-sm font-semibold text-emerald-700">How to present this demo</h3>
                    <p>Lead with the map for a 60-second visualization, open the detail drawer to show compliance guardrails, flip to Supervisor View for governance, then close with these roadmap beats to tee up next-phase conversations.</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
                    >
                      Close brief
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
