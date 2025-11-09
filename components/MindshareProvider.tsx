"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  AdvisorSummary,
  BriefRecord,
  FiltersState,
  GraphLink,
  GraphNode,
  MindshareStats,
  TrainingModule,
  TopicKey
} from "@/lib/types";
import { ADVISOR_TENURE, OFFICES, PRODUCTS, RISK_BANDS, TRAINING_MODULES } from "@/lib/constants";
import {
  buildSyntheticUniverse,
  computeVectorMap,
  createSyntheticBrief,
  createBriefFromForm,
  type BriefFormInput
} from "@/lib/generator";
import { createAuditPdf, createAuditSnapshot, downloadBlob } from "@/lib/export";
import { nearestNeighbors, vectorForTopics } from "@/lib/topics";

export type ClusterMode = "Topic" | "Office" | "Product";
export type RoleMode = "recruiter" | "supervisor";

interface TrainingHistoryEntry {
  advisorId: string;
  topic: TopicKey;
  completedAt: string;
}

interface MindshareContextValue {
  briefs: BriefRecord[];
  advisors: AdvisorSummary[];
  modules: TrainingModule[];
  filters: FiltersState;
  setFilters: (next: FiltersState) => void;
  resetFilters: () => void;
  clusterMode: ClusterMode;
  setClusterMode: (mode: ClusterMode) => void;
  role: RoleMode;
  setRole: (role: RoleMode) => void;
  stats: MindshareStats;
  graph: { nodes: GraphNode[]; links: GraphLink[] };
  filteredBriefs: BriefRecord[];
  selectedBrief: BriefRecord | null;
  setSelectedBrief: (brief: BriefRecord | null) => void;
  regenerateDataset: (seed?: string) => void;
  generateAdditionalBriefs: (count: number) => void;
  createBriefFromInput: (input: BriefFormInput) => void;
  approveBrief: (id: string) => void;
  requestChanges: (id: string, comment: string) => void;
  assignMicroLesson: (advisorId: string, topic: TopicKey) => void;
  completeMicroLesson: (advisorId: string, topic: TopicKey) => void;
  microLessonStats: { assigned: number; completed: number };
  exportAuditBundle: () => Promise<void>;
  trainingCompletions: TrainingHistoryEntry[];
  escalateAdvisor: (advisorId: string, note: string) => void;
  insights: {
    lessonCompletionRate: number;
    redlineRate: number;
    averageFlags: number;
    supervisorPending: number;
  };
}

const defaultFilters: FiltersState = {
  offices: [],
  products: [],
  risks: [],
  tenure: [],
  searchTerm: "",
  complianceRange: [0, 100]
};

const MindshareContext = createContext<MindshareContextValue | null>(null);

export function MindshareProvider({ children }: { children: React.ReactNode }) {
  const [seed, setSeed] = useState<string>("mindshare-demo-seed");
  const [baseCount] = useState(220);
  const [briefs, setBriefs] = useState<BriefRecord[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorSummary[]>([]);
  const [filters, setFiltersState] = useState<FiltersState>(defaultFilters);
  const [clusterMode, setClusterMode] = useState<ClusterMode>("Topic");
  const [role, setRole] = useState<RoleMode>("recruiter");
  const [selectedBrief, setSelectedBrief] = useState<BriefRecord | null>(null);
  const [assignments, setAssignments] = useState<Array<{ advisorId: string; topic: TopicKey }>>([]);
  const [completions, setCompletions] = useState<TrainingHistoryEntry[]>([]);

  const modules = TRAINING_MODULES;

  const regenerateDataset = useCallback(
    (nextSeed?: string) => {
      const appliedSeed = nextSeed ?? `mindshare-${Math.random().toString(36).slice(2, 7)}`;
      const universe = buildSyntheticUniverse({ seed: appliedSeed, count: baseCount });
      setSeed(appliedSeed);
      setBriefs(universe.briefs);
      setAdvisors(universe.advisors);
      setAssignments([]);
      setCompletions([]);
      setSelectedBrief(null);
    },
    [baseCount]
  );

  useEffect(() => {
    regenerateDataset(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = useCallback(() => setFiltersState(defaultFilters), []);

  const filteredBriefs = useMemo(() => {
    return briefs.filter((brief) => {
      const inOffice = !filters.offices.length || filters.offices.includes(brief.office);
      const inProduct = !filters.products.length || filters.products.includes(brief.product);
      const inRisk = !filters.risks.length || filters.risks.includes(brief.client.risk);
      const inTenure = !filters.tenure.length || filters.tenure.includes(brief.advisor.tenure);
      const inRange = brief.complianceIQ >= filters.complianceRange[0] && brief.complianceIQ <= filters.complianceRange[1];
      const matchesSearch = filters.searchTerm
        ? `${brief.advisor.name} ${brief.topics.join(" ")}`.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;
      return inOffice && inProduct && inRisk && inTenure && inRange && matchesSearch;
    });
  }, [briefs, filters]);

  const stats = useMemo<MindshareStats>(() => {
    if (!filteredBriefs.length) {
      return {
        averageIQ: 0,
        briefsVisible: 0,
        topWeakTopic: null,
        flagsPerBrief: 0
      };
    }
    const averageIQ = Math.round(
      filteredBriefs.reduce((acc, brief) => acc + brief.complianceIQ, 0) / filteredBriefs.length
    );
    const flagsPerBrief = Number(
      (filteredBriefs.reduce((acc, brief) => acc + brief.flags.length, 0) / filteredBriefs.length).toFixed(1)
    );
    const weakTopicCount = filteredBriefs.reduce<Record<string, number>>((acc, brief) => {
      brief.weakTopics.forEach((topic) => {
        acc[topic] = (acc[topic] ?? 0) + 1;
      });
      return acc;
    }, {});
    const topWeakTopic = Object.entries(weakTopicCount).sort((a, b) => b[1] - a[1])[0]?.[0] as TopicKey | undefined;
    return {
      averageIQ,
      briefsVisible: filteredBriefs.length,
      topWeakTopic: topWeakTopic ?? null,
      flagsPerBrief
    };
  }, [filteredBriefs]);

  const vectorMap = useMemo(() => computeVectorMap(briefs), [briefs]);

  const graph = useMemo(() => {
    const nodes: GraphNode[] = filteredBriefs.map((brief) => ({
      id: brief.id,
      iq: brief.complianceIQ,
      topics: brief.topics,
      weakTopics: brief.weakTopics,
      clusterKey:
        clusterMode === "Office"
          ? brief.office
          : clusterMode === "Product"
          ? brief.product
          : brief.weakTopics[0] ?? "balanced",
      approved: brief.approved,
      vector: vectorMap[brief.id] ?? vectorForTopics(brief.topics)
    }));

    const filteredRecords = briefs.filter((brief) => nodes.some((node) => node.id === brief.id));
    const links = nearestNeighbors(filteredRecords, vectorMap, 3);

    return {
      nodes,
      links
    };
  }, [briefs, clusterMode, filteredBriefs, vectorMap]);

  const setFilters = useCallback((next: FiltersState) => setFiltersState(next), []);

  const generateAdditionalBriefs = useCallback(
    (count: number) => {
      const generated: BriefRecord[] = [];
      const newAdvisors: AdvisorSummary[] = [];
      for (let i = 0; i < count; i += 1) {
        const result = createSyntheticBrief(seed, baseCount, [...briefs, ...generated]);
        generated.push(result.brief);
        result.advisors.forEach((advisor) => {
          if (!newAdvisors.find((a) => a.id === advisor.id) && !advisors.find((a) => a.id === advisor.id)) {
            newAdvisors.push(advisor);
          }
        });
      }
      setBriefs((prev) => [...prev, ...generated]);
      if (newAdvisors.length) {
        setAdvisors((prev) => [...prev, ...newAdvisors]);
      }
    },
    [advisors, baseCount, briefs, seed]
  );

  const createBriefFromInput = useCallback(
    (input: BriefFormInput) => {
      const brief = createBriefFromForm(seed, input, briefs);
      setBriefs((prev) => [...prev, brief]);
      if (!advisors.find((advisor) => advisor.id === input.advisor.id)) {
        setAdvisors((prev) => [...prev, input.advisor]);
      }
      setSelectedBrief(brief);
    },
    [advisors, briefs, seed]
  );

  const approveBrief = useCallback((id: string) => {
    setBriefs((prev) => prev.map((brief) => (brief.id === id ? { ...brief, approved: true, supervisorComment: undefined } : brief)));
  }, []);

  const requestChanges = useCallback((id: string, comment: string) => {
    setBriefs((prev) => prev.map((brief) => (brief.id === id ? { ...brief, approved: false, supervisorComment: comment } : brief)));
  }, []);

  const assignMicroLesson = useCallback((advisorId: string, topic: TopicKey) => {
    setAssignments((prev) => [...prev, { advisorId, topic }]);
  }, []);

  const completeMicroLesson = useCallback((advisorId: string, topic: TopicKey) => {
    setCompletions((prev) => [...prev, { advisorId, topic, completedAt: new Date().toISOString() }]);
    // Simulate improved coverage: boost future briefs for advisor on that topic
    setBriefs((prev) =>
      prev.map((brief) => {
        if (brief.advisor.id !== advisorId) return brief;
        if (!brief.weakTopics.includes(topic)) return brief;
        const coverageBoosted = { ...brief.coverage, [topic]: Math.min(1, brief.coverage[topic] + 0.1) };
        const weakTopics = brief.weakTopics.filter((t) => t !== topic);
        return { ...brief, coverage: coverageBoosted, weakTopics };
      })
    );
  }, []);

  const microLessonStats = useMemo(() => {
    return {
      assigned: assignments.length,
      completed: completions.length
    };
  }, [assignments.length, completions.length]);

  const insights = useMemo(() => {
    const totalBriefs = briefs.length || 1;
    const lessonCompletionRate = assignments.length
      ? Math.round((completions.length / assignments.length) * 100)
      : 0;
    const totalFlags = briefs.reduce((acc, brief) => acc + brief.flags.length, 0);
    const redlineRate = Math.round((totalFlags / totalBriefs) * 100) / 100;
    const averageFlags = Number((totalFlags / totalBriefs).toFixed(2));
    const supervisorPending = briefs.filter((brief) => !brief.approved).length;
    return {
      lessonCompletionRate,
      redlineRate,
      averageFlags,
      supervisorPending
    };
  }, [assignments.length, briefs, completions.length]);

  const exportAuditBundle = useCallback(async () => {
    const snapshot = createAuditSnapshot(filteredBriefs, filters, microLessonStats);
    const jsonBlob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    downloadBlob(jsonBlob, `mindshare-audit-${Date.now()}.json`);

    const pdfBlob = await createAuditPdf(snapshot);
    downloadBlob(pdfBlob, `mindshare-audit-${Date.now()}.pdf`);
  }, [filteredBriefs, filters, microLessonStats]);

  const escalateAdvisor = useCallback((advisorId: string, note: string) => {
    setAdvisors((prev) =>
      prev.map((advisor) =>
        advisor.id === advisorId ? { ...advisor, escalated: true, escalatedNote: note } : advisor
      )
    );
    setBriefs((prev) =>
      prev.map((brief) =>
        brief.advisor.id === advisorId
          ? { ...brief, advisor: { ...brief.advisor, escalated: true, escalatedNote: note } }
          : brief
      )
    );
  }, []);

  const contextValue: MindshareContextValue = {
    briefs,
    advisors,
    modules,
    filters,
    setFilters,
    resetFilters,
    clusterMode,
    setClusterMode,
    role,
    setRole,
    stats,
    graph,
    filteredBriefs,
    selectedBrief,
    setSelectedBrief,
    regenerateDataset,
    generateAdditionalBriefs,
    createBriefFromInput,
    approveBrief,
    requestChanges,
    assignMicroLesson,
    completeMicroLesson,
    microLessonStats,
    exportAuditBundle,
    trainingCompletions: completions,
    escalateAdvisor,
    insights
  };

  return <MindshareContext.Provider value={contextValue}>{children}</MindshareContext.Provider>;
}

export function useMindshare() {
  const ctx = useContext(MindshareContext);
  if (!ctx) {
    throw new Error("Mindshare context missing");
  }
  return ctx;
}
