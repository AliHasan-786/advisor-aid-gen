import { FORBIDDEN_PHRASES, TOPIC_KEYWORDS } from "@/lib/constants";
import type { ComplianceCoverage, TopicKey } from "@/lib/types";

export function computeCoverageFromText(text: string, explicitTopics: TopicKey[]): ComplianceCoverage {
  const normalized = text.toLowerCase();

  const coverage = (Object.keys(TOPIC_KEYWORDS) as TopicKey[]).reduce<Record<TopicKey, number>>((acc, topic) => {
    const hasKeyword = TOPIC_KEYWORDS[topic].some((keyword) => normalized.includes(keyword));
    const hasExplicit = explicitTopics.includes(topic);
    acc[topic] = hasKeyword || hasExplicit ? 1 : 0;
    return acc;
  }, {} as Record<TopicKey, number>);

  return coverage as ComplianceCoverage;
}

export function weightedComplianceIQ(coverage: ComplianceCoverage, flags: number): number {
  const weights: Record<TopicKey, number> = {
    suitability_objective: 0.18,
    risk_tolerance: 0.18,
    liquidity_needs: 0.14,
    time_horizon: 0.14,
    conflict_disclosure: 0.18,
    recordkeeping: 0.18
  };

  const weightSum = Object.values(weights).reduce((acc, val) => acc + val, 0);
  const weighted = (Object.keys(weights) as TopicKey[]).reduce((total, key) => {
    return total + coverage[key] * weights[key];
  }, 0);

  const baseScore = (weighted / weightSum) * 100;
  const penalty = Math.min(flags * 2, 10);
  return Math.max(0, Math.round(baseScore - penalty));
}

export function deriveWeakTopics(coverage: ComplianceCoverage, iq: number): TopicKey[] {
  const weak: TopicKey[] = [];
  (Object.keys(coverage) as TopicKey[]).forEach((topic) => {
    if (coverage[topic] < 0.6) {
      weak.push(topic);
    }
  });
  if (iq < 70) {
    weak.push("suitability_objective");
  }
  return Array.from(new Set(weak));
}

export function detectForbiddenPhrases(text: string): string[] {
  const normalized = text.toLowerCase();
  return FORBIDDEN_PHRASES.filter((phrase) => normalized.includes(phrase));
}
