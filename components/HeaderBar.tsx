"use client";

import { useState } from "react";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { useMindshare, type ClusterMode } from "@/components/MindshareProvider";
import { ProductBriefModal } from "@/components/ProductBriefModal";

const CLUSTER_OPTIONS: ClusterMode[] = ["Topic", "Office", "Product"];

export function HeaderBar() {
  const {
    clusterMode,
    setClusterMode,
    role,
    setRole,
    regenerateDataset,
    generateAdditionalBriefs,
    exportAuditBundle,
    stats
  } = useMindshare();
  const [newBriefCount, setNewBriefCount] = useState<number>(3);

  return (
    <header className="border-b border-slate-200 bg-white/90 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-navy-800">Mindshare Map</h1>
          <span className="rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600">
            Demo Mode
          </span>
        </div>
        <p className="text-sm text-slate-500">AI-Governed Field Insight — Synthetic Data Demo • No real advisor information</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <span>Supervisor View</span>
          <button
            type="button"
            onClick={() => setRole(role === "recruiter" ? "supervisor" : "recruiter")}
            className={clsx(
              "h-5 w-10 rounded-full border transition",
              role === "supervisor" ? "border-navy-500 bg-navy-500" : "border-slate-300 bg-white"
            )}
            aria-label="Toggle supervisor view"
          >
            <span
              className={clsx(
                "block h-4 w-4 rounded-full bg-white shadow transition",
                role === "supervisor" ? "translate-x-5" : "translate-x-[2px]"
              )}
            />
          </button>
        </label>

        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
          <span>Cluster by:</span>
          {CLUSTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setClusterMode(option)}
              className={clsx(
                "rounded-full px-2.5 py-1",
                clusterMode === option ? "bg-navy-600 text-white" : "hover:bg-slate-100"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">
          <input
            type="number"
            min={1}
            max={10}
            value={newBriefCount}
            onChange={(event) => setNewBriefCount(Math.min(10, Math.max(1, Number(event.target.value))))}
            className="h-6 w-12 rounded border border-slate-200 px-2 text-xs focus:border-navy-500 focus:outline-none"
            aria-label="Number of synthetic briefs to add"
          />
          <button
            type="button"
            onClick={() => generateAdditionalBriefs(newBriefCount)}
            title="Inject additional synthetic briefs into the graph"
            className="rounded-full bg-navy-600 px-3 py-1 font-semibold text-white transition hover:bg-navy-700"
          >
            Add {newBriefCount}
          </button>
        </div>

        <button
          type="button"
          onClick={() => regenerateDataset()}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-navy-400"
        >
          <RefreshCw className="h-4 w-4" /> Refresh dataset
        </button>

        <button
          type="button"
          onClick={exportAuditBundle}
          className="flex items-center gap-2 rounded-full bg-navy-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-navy-700"
        >
          <Download className="h-4 w-4" /> Export Audit
        </button>

        <ProductBriefModal />

        <div className="hidden md:flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700">
          <ShieldCheck className="h-4 w-4" /> Avg IQ: {stats.averageIQ}
        </div>
      </div>
      </div>
    </header>
  );
}
