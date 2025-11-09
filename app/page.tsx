"use client";

import { MindshareProvider, useMindshare } from "@/components/MindshareProvider";
import { HeaderBar } from "@/components/HeaderBar";
import { FilterPanel } from "@/components/FilterPanel";
import { ForceGraphCanvas } from "@/components/ForceGraphCanvas";
import { DetailDrawer } from "@/components/DetailDrawer";
import { SupervisorPanel } from "@/components/SupervisorPanel";
import { CreateBriefDrawer } from "@/components/CreateBriefDrawer";
import { GuidedTour } from "@/components/GuidedTour";
import { InfoDrawer } from "@/components/InfoDrawer";
import type { TopicKey } from "@/lib/types";

function MindshareShell() {
  const { filteredBriefs, insights } = useMindshare();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <HeaderBar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterPanel />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Showing {filteredBriefs.length} briefs clustered in the insight map below. Hover to preview; click to open details.
              </p>
              <CreateBriefDrawer />
            </div>
            <InsightsRibbon insights={insights} />
            <ForceGraphCanvas />
          </div>
        </div>
        <SupervisorPanel />
      </main>
      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
        Mindshare Map — AI-Governed Field Insight (Demo). Synthetic Demo Data • Not affiliated with any real firm.
      </footer>
      <DetailDrawer />
      <InfoDrawer />
      <GuidedTour />
    </div>
  );
}

export default function Page() {
  return (
    <MindshareProvider>
      <MindshareShell />
    </MindshareProvider>
  );
}

interface InsightMetrics {
  lessonCompletionRate: number;
  redlineRate: number;
  averageFlags: number;
  supervisorPending: number;
}

function InsightsRibbon({ insights }: { insights: InsightMetrics }) {
  const tiles = [
    {
      label: "Lesson completion",
      value: `${insights.lessonCompletionRate}%`,
      hint: "Completed micro-lessons vs. assignments"
    },
    {
      label: "Redline rate",
      value: `${insights.redlineRate}%`,
      hint: "Flags per brief (all time)"
    },
    {
      label: "Avg flags / brief",
      value: insights.averageFlags,
      hint: "Governance touchpoints per meeting"
    },
    {
      label: "Supervisor queue",
      value: insights.supervisorPending,
      hint: "Briefs awaiting approval"
    }
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{tile.label}</p>
          <p className="text-2xl font-semibold text-navy-700">{tile.value}</p>
          <p className="text-xs text-slate-500">{tile.hint}</p>
        </div>
      ))}
    </div>
  );
}
