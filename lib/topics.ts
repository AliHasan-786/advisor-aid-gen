import type { BriefRecord, TopicKey } from "@/lib/types";
import { TOPIC_KEYWORDS, TOPIC_VECTORS } from "@/lib/constants";

export function extractTopics(text: string): TopicKey[] {
  const normalized = text.toLowerCase();
  const topics = (Object.keys(TOPIC_KEYWORDS) as TopicKey[]).filter((topic) =>
    TOPIC_KEYWORDS[topic].some((keyword) => normalized.includes(keyword))
  );
  return topics.length ? topics : ["suitability_objective"];
}

export function vectorForTopics(topics: TopicKey[]): [number, number] {
  if (!topics.length) return [0, 0];
  const sum = topics.reduce(
    (acc, topic) => {
      const vec = TOPIC_VECTORS[topic];
      return [acc[0] + vec[0], acc[1] + vec[1]] as [number, number];
    },
    [0, 0] as [number, number]
  );
  return [sum[0] / topics.length, sum[1] / topics.length];
}

export function cosineSimilarity(a: [number, number], b: [number, number]): number {
  const dot = a[0] * b[0] + a[1] * b[1];
  const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2);
  const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function nearestNeighbors(
  records: BriefRecord[],
  vectorMap?: Record<string, [number, number]>,
  count = 3
): Array<{ source: string; target: string; strength: number }> {
  const vectors = records.map((record) => ({
    id: record.id,
    vec: vectorMap?.[record.id] ?? vectorForTopics(record.topics)
  }));
  const links: Array<{ source: string; target: string; strength: number }> = [];

  vectors.forEach((node, idx) => {
    const neighbors = vectors
      .filter((_, j) => j !== idx)
      .map((candidate) => ({
        id: candidate.id,
        sim: cosineSimilarity(node.vec, candidate.vec)
      }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, count);

    neighbors.forEach((neighbor) => {
      if (!Number.isFinite(neighbor.sim) || neighbor.sim < 0.22) return;
      links.push({ source: node.id, target: neighbor.id, strength: Math.max(neighbor.sim, 0) });
    });
  });

  return links;
}
