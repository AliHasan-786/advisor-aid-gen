"use client";

import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import { useMindshare } from "@/components/MindshareProvider";
import type { TopicKey } from "@/lib/types";
import { MicroLessonModal } from "@/components/MicroLessonModal";

const COVERAGE_LABELS: Record<TopicKey, string> = {
  suitability_objective: "Suitability Objective",
  risk_tolerance: "Risk Tolerance",
  liquidity_needs: "Liquidity Needs",
  time_horizon: "Time Horizon",
  conflict_disclosure: "Conflict Disclosure",
  recordkeeping: "Recordkeeping"
};

function CoverageBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-navy-500" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

export function DetailDrawer() {
  const {
    selectedBrief,
    setSelectedBrief,
    modules,
    assignMicroLesson,
    completeMicroLesson,
    role,
    approveBrief,
    requestChanges
  } = useMindshare();
  const [lessonModule, setLessonModule] = useState<string | null>(null);
  const [requestComment, setRequestComment] = useState("");

  const open = Boolean(selectedBrief);

  const relevantModules = useMemo(() => {
    if (!selectedBrief) return [];
    const weakSet = new Set(selectedBrief.weakTopics);
    const matches = modules.filter((module) => weakSet.has(module.topic));
    return matches.length ? matches : modules.slice(0, 2);
  }, [modules, selectedBrief]);

  const handleAssign = (topic: TopicKey) => {
    if (!selectedBrief) return;
    assignMicroLesson(selectedBrief.advisor.id, topic);
  };

  const handleComplete = (topic: TopicKey) => {
    if (!selectedBrief) return;
    completeMicroLesson(selectedBrief.advisor.id, topic);
  };

  const closeDrawer = () => {
    setSelectedBrief(null);
    setLessonModule(null);
    setRequestComment("");
  };

  return (
    <>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={closeDrawer} className="relative z-40">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/20" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 flex justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
                  {selectedBrief && (
                    <div className="flex h-full flex-col gap-6 p-6">
                      <header className="space-y-2 border-b border-slate-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-navy-700">{selectedBrief.advisor.name}</h2>
                            <p className="text-sm text-slate-500">
                              {selectedBrief.office} • {selectedBrief.product} • {new Date(selectedBrief.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={clsx(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              selectedBrief.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {selectedBrief.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          Goal: Transform meeting briefs into measurable learning signals. Compliance IQ {selectedBrief.complianceIQ}
                        </p>
                      </header>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">Compliance Coverage</h3>
                        <div className="space-y-2">
                          {(Object.keys(selectedBrief.coverage) as TopicKey[]).map((topic) => (
                            <CoverageBar key={topic} label={COVERAGE_LABELS[topic]} value={selectedBrief.coverage[topic]} />
                          ))}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">Redlines</h3>
                        {selectedBrief.flags.length ? (
                          <ul className="space-y-2 text-sm text-slate-600">
                            {selectedBrief.flags.map((flag) => (
                              <li key={flag.text} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-center gap-2 text-amber-700">
                                  <TriangleAlert className="h-4 w-4" />
                                  <span>{flag.reason}</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500 line-through">{flag.text}</p>
                                <p className="text-xs text-emerald-600">Suggested: {flag.fix}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" /> No redlines detected.
                          </div>
                        )}
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">Suggested Micro-Lessons</h3>
                        <div className="flex flex-wrap gap-2">
                          {relevantModules.map((module) => (
                            <button
                              key={module.id}
                              type="button"
                              onClick={() => setLessonModule(module.id)}
                              className="rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700 hover:border-navy-400"
                            >
                              {module.title}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAssign(relevantModules[0]?.topic ?? "suitability_objective")}
                          className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                        >
                          Assign Micro-Lesson
                        </button>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700">Brief Narrative</h3>
                        <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                          {selectedBrief.briefText}
                        </pre>
                      </section>

                      {role === "supervisor" && (
                        <section className="space-y-3 border-t border-slate-200 pt-4">
                          <h3 className="text-sm font-semibold text-slate-700">Supervisor Actions</h3>
                          {selectedBrief.supervisorComment && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                              Last comment: {selectedBrief.supervisorComment}
                            </div>
                          )}
                          <textarea
                            value={requestComment}
                            onChange={(event) => setRequestComment(event.target.value)}
                            placeholder="Supervisor comment..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                approveBrief(selectedBrief.id);
                                closeDrawer();
                              }}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                requestChanges(selectedBrief.id, requestComment || "Supervisor requested edits.");
                                closeDrawer();
                              }}
                              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              Request Changes
                            </button>
                          </div>
                        </section>
                      )}

                      <footer className="mt-auto border-t border-slate-200 pt-3 text-center text-xs text-slate-400">
                        Synthetic Demo Data • Not affiliated with any real firm.
                      </footer>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <MicroLessonModal
        open={lessonModule !== null}
        onClose={() => setLessonModule(null)}
        module={modules.find((module) => module.id === lessonModule) ?? null}
        onComplete={() => {
          if (!selectedBrief) return;
          const topic = modules.find((module) => module.id === lessonModule)?.topic;
          if (topic) {
            handleComplete(topic);
          }
        }}
      />
    </>
  );
}
