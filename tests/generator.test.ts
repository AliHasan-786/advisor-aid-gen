import { describe, expect, it } from "vitest";
import { buildSyntheticUniverse } from "@/lib/generator";

describe("synthetic universe", () => {
  it("is deterministic per seed", () => {
    const first = buildSyntheticUniverse({ seed: "demo", count: 10 });
    const second = buildSyntheticUniverse({ seed: "demo", count: 10 });
    expect(first.briefs.map((brief) => brief.complianceIQ)).toEqual(
      second.briefs.map((brief) => brief.complianceIQ)
    );
  });

  it("generates requested count", () => {
    const universe = buildSyntheticUniverse({ seed: "demo-2", count: 50 });
    expect(universe.briefs).toHaveLength(50);
  });
});
