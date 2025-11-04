import type { Brief } from '@/types/mindshare';

/**
 * Calculate Compliance IQ score for a brief
 * 
 * Compliance IQ is computed as:
 * 1. Weighted sum of coverage dimensions (0-1 each, scaled to 0-100)
 * 2. Minus 2 points per forbidden phrase detected (max -10 points)
 * 
 * Weights (totaling 1.0):
 * - suitability_objective: 18%
 * - risk_tolerance: 18%
 * - liquidity_needs: 14%
 * - time_horizon: 14%
 * - conflict_disclosure: 18%
 * - recordkeeping: 18%
 */
export function calculateComplianceIQ(coverage: Brief['coverage'], flagCount: number): number {
  const weights = {
    suitability_objective: 0.18,
    risk_tolerance: 0.18,
    liquidity_needs: 0.14,
    time_horizon: 0.14,
    conflict_disclosure: 0.18,
    recordkeeping: 0.18
  };

  // Calculate weighted sum
  let iq = 0;
  for (const [dimension, weight] of Object.entries(weights)) {
    iq += coverage[dimension as keyof Brief['coverage']] * weight;
  }

  // Scale to 0-100
  iq *= 100;

  // Deduct for compliance violations (forbidden phrases)
  iq -= Math.min(flagCount * 2, 10);

  return Math.max(0, Math.min(100, Math.round(iq)));
}

/**
 * Identify weak topics (dimensions scoring below threshold)
 */
export function identifyWeakTopics(coverage: Brief['coverage'], threshold: number = 0.6): string[] {
  return Object.entries(coverage)
    .filter(([_, score]) => score < threshold)
    .map(([topic]) => topic);
}

/**
 * Calculate aggregate statistics for a set of briefs
 */
export function calculateAggregateStats(briefs: Brief[]) {
  if (briefs.length === 0) {
    return {
      avgComplianceIQ: 0,
      totalBriefs: 0,
      avgFlagsPerBrief: 0,
      topWeakTopic: 'None',
      topWeakTopicCount: 0
    };
  }

  const totalIQ = briefs.reduce((sum, b) => sum + b.complianceIQ, 0);
  const totalFlags = briefs.reduce((sum, b) => sum + b.flags.length, 0);

  // Count weak topics across all briefs
  const weakTopicCounts: Record<string, number> = {};
  briefs.forEach(brief => {
    brief.weakTopics.forEach(topic => {
      weakTopicCounts[topic] = (weakTopicCounts[topic] || 0) + 1;
    });
  });

  const sortedWeakTopics = Object.entries(weakTopicCounts).sort((a, b) => b[1] - a[1]);
  const topWeakTopic = sortedWeakTopics[0]?.[0] || 'None';
  const topWeakTopicCount = sortedWeakTopics[0]?.[1] || 0;

  return {
    avgComplianceIQ: Math.round(totalIQ / briefs.length),
    totalBriefs: briefs.length,
    avgFlagsPerBrief: (totalFlags / briefs.length).toFixed(1),
    topWeakTopic: topWeakTopic.replace(/_/g, ' '),
    topWeakTopicCount
  };
}

/**
 * Get color for Compliance IQ score
 */
export function getComplianceIQColor(score: number): string {
  if (score >= 85) return 'hsl(142, 76%, 36%)'; // green
  if (score >= 70) return 'hsl(45, 93%, 47%)'; // yellow
  return 'hsl(0, 84%, 60%)'; // red
}

/**
 * Get color for coverage dimension score
 */
export function getCoverageColor(score: number): string {
  if (score >= 0.8) return 'hsl(142, 76%, 36%)';
  if (score >= 0.6) return 'hsl(45, 93%, 47%)';
  return 'hsl(0, 84%, 60%)';
}
