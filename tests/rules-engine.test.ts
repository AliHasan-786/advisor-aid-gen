import { describe, expect, it } from "vitest";
import { computeCoverageFromText, detectForbiddenPhrases, deriveWeakTopics, weightedComplianceIQ } from "@/lib/scoring";

const sample = `Agenda: Objective review. Document liquidity and risk tolerance. Disclosure summary logged. CRM updated.`;

describe("compliance scoring", () => {
  it("computes coverage from text", () => {
    const coverage = computeCoverageFromText(sample, []);
    expect(coverage.suitability_objective).toBe(1);
    expect(coverage.risk_tolerance).toBe(1);
    expect(coverage.recordkeeping).toBe(1);
  });

  it("detects forbidden phrases", () => {
    expect(detectForbiddenPhrases("This option is guaranteed")).toContain("guaranteed");
  });

  it("derives weak topics when coverage low", () => {
    const coverage = computeCoverageFromText("neutral", []);
    const weak = deriveWeakTopics(coverage, 55);
    expect(weak.length).toBeGreaterThan(0);
  });

  it("applies penalty to compliance IQ", () => {
    const coverage = computeCoverageFromText(sample, []);
    const base = weightedComplianceIQ(coverage, 0);
    const penalized = weightedComplianceIQ(coverage, 3);
    expect(base).toBeGreaterThan(penalized);
  });
});
