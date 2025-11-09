declare module "react-force-graph-2d" {
  import { ComponentType } from "react";

  export interface GraphData {
    nodes: Array<Record<string, any>>;
    links: Array<Record<string, any>>;
  }

  const ForceGraph2D: ComponentType<{
    graphData: GraphData;
    width?: number;
    height?: number;
    nodeAutoColorBy?: string | undefined;
    backgroundColor?: string;
    linkColor?: (link: any) => string;
    linkWidth?: (link: any) => number;
    linkDirectionalParticles?: number;
    nodeRelSize?: number;
    cooldownTicks?: number;
    warmupTicks?: number;
    d3VelocityDecay?: number;
    d3Force?: (forceGraph: { d3Force: (...args: any[]) => any }) => void;
    onNodeClick?: (node: any) => void;
    nodeCanvasObjectMode?: (node: any) => "before" | "after" | undefined;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D) => void;
    nodeLabel?: (node: any) => string;
  }>;

  export default ForceGraph2D;
}
