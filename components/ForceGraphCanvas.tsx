"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import type { GraphData } from "react-force-graph-2d";
import { forceCollide } from "d3-force";
import { useMindshare } from "@/components/MindshareProvider";
import type { TopicKey } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const TOPIC_COLORS: Record<string, string> = {
  suitability_objective: "#1d4ed8",
  risk_tolerance: "#a855f7",
  liquidity_needs: "#0ea5e9",
  time_horizon: "#f97316",
  conflict_disclosure: "#ef4444",
  recordkeeping: "#22c55e",
  balanced: "#64748b"
};

const APPROVAL_COLOR = "#ef4444";

function nodeColor(node: any, clusterMode: string) {
  if (!node.approved) return APPROVAL_COLOR;
  const key = clusterMode === "Topic" ? node.weakTopics[0] ?? "balanced" : node.clusterKey;
  return TOPIC_COLORS[key] ?? "#334155";
}

function tooltipText(node: any) {
  return `${node.id}\nIQ ${node.iq}\nWeak: ${node.weakTopics.join(", ") || "none"}`;
}

export const ForceGraphCanvas = memo(function ForceGraphCanvas() {
  const { graph, setSelectedBrief, clusterMode, briefs } = useMindshare();

  const chargeStrength = useMemo(() => (graph.nodes.length > 0 ? -180 : -120), [graph.nodes.length]);

  const data = useMemo<GraphData>(() => ({
    nodes: graph.nodes.map((node) => ({ ...node })),
    links: graph.links.map((link) => ({ ...link }))
  }), [graph.links, graph.nodes]);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <ForceGraph2D
        graphData={data}
        width={undefined}
        height={undefined}
        nodeAutoColorBy={undefined}
        backgroundColor="white"
        linkColor={() => "rgba(100, 116, 139, 0.25)"}
        linkWidth={() => 0.8}
        linkDirectionalParticles={0}
        nodeRelSize={5}
        cooldownTicks={80}
        warmupTicks={60}
        d3VelocityDecay={0.15}
        d3Force={(fg) => {
          fg.d3Force("charge")?.strength(chargeStrength);
          fg.d3Force("collision", forceCollide(22));
        }}
        onNodeClick={(node) => {
          const match = briefs.find((brief) => brief.id === node.id);
          if (match) {
            setSelectedBrief(match);
          }
        }}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx) => {
          const typedNode = node as any;
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, 6, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor(typedNode, clusterMode);
          ctx.fill();
          ctx.font = "11px 'Inter', sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255,255,255,0.88)";
          ctx.fillRect((node.x ?? 0) + 8, (node.y ?? 0) - 7, 40, 14);
          ctx.fillStyle = "#0f172a";
          ctx.fillText(`IQ ${typedNode.iq}`, (node.x ?? 0) + 10, node.y ?? 0);
          ctx.restore();
        }}
        nodeLabel={(node) => tooltipText(node)}
      />
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        <p className="font-semibold text-slate-700">Legend ({clusterMode})</p>
        <ul className="mt-1 space-y-0.5">
          {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
            <li key={topic} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{topic.replace(/_/g, " ")}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: APPROVAL_COLOR }} />
            <span>Unapproved</span>
          </li>
        </ul>
      </div>
    </div>
  );
});
