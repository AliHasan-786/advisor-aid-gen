"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ADVISOR_TENURE, MILESTONE_LIBRARY, OFFICES, PRODUCTS, RISK_BANDS } from "@/lib/constants";
import { useMindshare } from "@/components/MindshareProvider";
import type { AdvisorSummary, AdvisorTenure, ClientProfile } from "@/lib/types";
import clsx from "clsx";

export function CreateBriefDrawer() {
  const { advisors, createBriefFromInput } = useMindshare();
  const [open, setOpen] = useState(false);
  const [advisorId, setAdvisorId] = useState<string>(advisors[0]?.id ?? "");
  const [newAdvisorName, setNewAdvisorName] = useState("");
  const [newAdvisorTenure, setNewAdvisorTenure] = useState<AdvisorTenure>("novice");
  const [office, setOffice] = useState(OFFICES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [risk, setRisk] = useState(RISK_BANDS[1]);
  const [ageBand, setAgeBand] = useState<ClientProfile["ageBand"]>("36–50");
  const [dependents, setDependents] = useState(1);
  const [milestones, setMilestones] = useState<string[]>([MILESTONE_LIBRARY[0]]);
  const [objective, setObjective] = useState("Reaffirm retirement income coverage before open enrollment.");
  const [channel, setChannel] = useState<"In-Person" | "Virtual">("Virtual");
  const [timeAvailable, setTimeAvailable] = useState<15 | 30 | 60>(30);

  const close = () => {
    setOpen(false);
  };

  const toggleMilestone = (value: string) => {
    setMilestones((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = () => {
    const advisor: AdvisorSummary = advisorId
      ? advisors.find((item) => item.id === advisorId) ?? advisors[0]
      : {
          id: `advisor-${Date.now()}`,
          name: newAdvisorName || "New Advisor",
          tenure: newAdvisorTenure,
          office
        };
    createBriefFromInput({
      advisor,
      office,
      product,
      risk,
      ageBand,
      dependents,
      milestones,
      objective,
      channel,
      timeAvailable
    });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-navy-700"
      >
        Create New Brief
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={close} className="relative z-50">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-xl font-semibold text-navy-700">Create Synthetic Brief</Dialog.Title>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Advisor</label>
                      <select
                        value={advisorId}
                        onChange={(event) => setAdvisorId(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {advisors.map((advisor) => (
                          <option key={advisor.id} value={advisor.id}>
                            {advisor.name} ({advisor.tenure})
                          </option>
                        ))}
                        <option value="">Create new advisor</option>
                      </select>
                    </div>
                    {!advisorId && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">New advisor name</label>
                        <input
                          type="text"
                          value={newAdvisorName}
                          onChange={(event) => setNewAdvisorName(event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                        />
                        <label className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tenure</label>
                        <select
                          value={newAdvisorTenure}
                          onChange={(event) => setNewAdvisorTenure(event.target.value as AdvisorTenure)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                        >
                          {ADVISOR_TENURE.map((tenure) => (
                            <option key={tenure} value={tenure}>
                              {tenure}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Office</label>
                      <select
                        value={office}
                        onChange={(event) => setOffice(event.target.value as typeof office)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {OFFICES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</label>
                      <select
                        value={product}
                        onChange={(event) => setProduct(event.target.value as typeof product)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {PRODUCTS.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client Risk</label>
                      <select
                        value={risk}
                        onChange={(event) => setRisk(event.target.value as typeof risk)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {RISK_BANDS.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Age Band</label>
                      <select
                        value={ageBand}
                        onChange={(event) => setAgeBand(event.target.value as ClientProfile["ageBand"])}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {(["18–25", "26–35", "36–50", "51–65"] as ClientProfile["ageBand"][]).map((band) => (
                          <option key={band}>{band}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dependents</label>
                      <input
                        type="number"
                        min={0}
                        max={4}
                        value={dependents}
                        onChange={(event) => setDependents(Number(event.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Milestones</label>
                      <div className="flex flex-wrap gap-2">
                        {MILESTONE_LIBRARY.map((milestone) => (
                          <button
                            type="button"
                            key={milestone}
                            onClick={() => toggleMilestone(milestone)}
                            className={clsx(
                              "rounded-full border px-3 py-1 text-xs",
                              milestones.includes(milestone)
                                ? "border-navy-500 bg-navy-100 text-navy-700"
                                : "border-slate-200 text-slate-600 hover:border-navy-300"
                            )}
                          >
                            {milestone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Objective</label>
                      <textarea
                        value={objective}
                        onChange={(event) => setObjective(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Channel</label>
                      <select
                        value={channel}
                        onChange={(event) => setChannel(event.target.value as typeof channel)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        <option>In-Person</option>
                        <option>Virtual</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time Available</label>
                      <select
                        value={timeAvailable}
                        onChange={(event) => setTimeAvailable(Number(event.target.value) as typeof timeAvailable)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                      >
                        {[15, 30, 60].map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {minutes} minutes
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
                    >
                      Generate Brief
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
