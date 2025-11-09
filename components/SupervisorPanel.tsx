"use client";

import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMindshare } from "@/components/MindshareProvider";
import type { BriefRecord } from "@/lib/types";

interface AdvisorRow {
  advisorId: string;
  advisorName: string;
  office: string;
  briefs: BriefRecord[];
  avgIQ: number;
  flags: number;
  lastBrief: string;
  weakTopics: string[];
  escalated: boolean;
}

export function SupervisorPanel() {
  const { role, filteredBriefs, advisors, approveBrief, requestChanges, escalateAdvisor } = useMindshare();
  const [escalatedId, setEscalatedId] = useState<string | null>(null);
  const [escalationNote, setEscalationNote] = useState("");

  const advisorRows = useMemo<AdvisorRow[]>(() => {
    return advisors.map((advisor) => {
      const briefs = filteredBriefs.filter((brief) => brief.advisor.id === advisor.id);
      const avgIQ = briefs.length ? Math.round(briefs.reduce((acc, brief) => acc + brief.complianceIQ, 0) / briefs.length) : 0;
      const flags = briefs.reduce((acc, brief) => acc + brief.flags.length, 0);
      const lastBrief = briefs.length ? briefs.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].createdAt : "";
      const weakTopicSet = new Set<string>();
      briefs.forEach((brief) => brief.weakTopics.forEach((topic) => weakTopicSet.add(topic)));
      return {
        advisorId: advisor.id,
        advisorName: advisor.name,
        office: advisor.office,
        briefs,
        avgIQ,
        flags,
        lastBrief,
        weakTopics: Array.from(weakTopicSet),
        escalated: advisor.escalated ?? false
      };
    });
  }, [advisors, filteredBriefs]);

  if (role !== "supervisor") {
    return null;
  }

  return (
    <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-700">Supervisor Heatmap</h2>
        <p className="text-xs text-slate-500">Monitor patterns, escalate coaching, and finalize brief approvals.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Advisor</th>
              <th className="px-3 py-2 text-left">Office</th>
              <th className="px-3 py-2 text-left">Avg IQ</th>
              <th className="px-3 py-2 text-left">Briefs</th>
              <th className="px-3 py-2 text-left">Flags</th>
              <th className="px-3 py-2 text-left">Last Brief</th>
              <th className="px-3 py-2 text-left">Weak Topics</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {advisorRows.map((row) => (
              <tr key={row.advisorId} className="hover:bg-slate-50">
                <td className="w-40 truncate px-3 py-2 font-semibold text-slate-700" title={row.advisorName}>
                  {row.advisorName}
                  {row.escalated && <span className="ml-2 text-xs text-amber-600">⚑ escalated</span>}
                </td>
                <td className="w-24 px-3 py-2 text-slate-600 whitespace-nowrap">{row.office}</td>
                <td className={"w-20 px-3 py-2 font-semibold whitespace-nowrap " + (row.avgIQ < 70 ? "text-amber-600" : "text-slate-700")}>{row.avgIQ}</td>
                <td className="w-20 px-3 py-2 text-slate-600 whitespace-nowrap">{row.briefs.length}</td>
                <td className="w-20 px-3 py-2 text-slate-600 whitespace-nowrap">{row.flags}</td>
                <td className="w-28 px-3 py-2 text-slate-600 whitespace-nowrap">{row.lastBrief ? new Date(row.lastBrief).toLocaleDateString() : "—"}</td>
                <td className="w-48 truncate px-3 py-2 text-xs text-slate-600" title={row.weakTopics.join(", ")}>
                  {row.weakTopics.join(", ") || ""}
                </td>
                <td className="w-36 px-3 py-2 text-xs text-navy-600">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEscalatedId(row.advisorId)}
                      className="rounded border border-amber-300 px-2 py-1 hover:bg-amber-50"
                    >
                      Escalate
                    </button>
                    {row.briefs.find((brief) => !brief.approved) && (
                      <button
                        type="button"
                        onClick={() => {
                          const pending = row.briefs.find((brief) => !brief.approved);
                          if (pending) {
                            approveBrief(pending.id);
                          }
                        }}
                        className="rounded border border-emerald-300 px-2 py-1 hover:bg-emerald-50"
                      >
                        Approve pending brief
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Transition show={escalatedId !== null} as={Fragment}>
        <Dialog onClose={() => setEscalatedId(null)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/50" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold text-navy-700">Escalate Coaching</Dialog.Title>
                <textarea
                  placeholder="Focus next meetings on liquidity & conflict disclosures..."
                  value={escalationNote}
                  onChange={(event) => setEscalationNote(event.target.value)}
                  className="h-32 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEscalatedId(null)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (escalatedId) {
                        escalateAdvisor(escalatedId, escalationNote || "Supervisor escalation sent.");
                      }
                      setEscalatedId(null);
                      setEscalationNote("");
                    }}
                    className="rounded-lg bg-navy-600 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-700"
                  >
                    Send Note
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
