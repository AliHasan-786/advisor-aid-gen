import { format } from "date-fns";
import { ADVISOR_TENURE, CHANNELS, MILESTONE_LIBRARY, OFFICES, PRODUCTS, RISK_BANDS, TRAINING_MODULES } from "@/lib/constants";
import { chance, createRng, pickMany, pickOne, randInt, type RNG } from "@/lib/random";
import { detectForbiddenPhrases, deriveWeakTopics, weightedComplianceIQ, computeCoverageFromText } from "@/lib/scoring";
import { extractTopics, vectorForTopics } from "@/lib/topics";
import type {
  AdvisorSummary,
  BriefRecord,
  ClientProfile,
  ComplianceCoverage,
  AdvisorTenure,
  TrainingModule,
  TopicKey,
  Office,
  Product,
  RiskBand
} from "@/lib/types";

const FIRST_NAMES = [
  "Jordan",
  "Taylor",
  "Avery",
  "Morgan",
  "Casey",
  "Devin",
  "Riley",
  "Sydney",
  "Alex",
  "Quinn",
  "Jamie",
  "Logan",
  "Parker",
  "Reese",
  "Rowan",
  "Elliott",
  "Harper",
  "Micah",
  "Emerson",
  "Kai"
];

const LAST_NAMES = [
  "Greene",
  "Lopez",
  "Patel",
  "Fischer",
  "Ramirez",
  "Sato",
  "Nakamura",
  "Bryant",
  "Singh",
  "O'Neill",
  "Hansen",
  "Diaz",
  "Carter",
  "Morales",
  "Hudson",
  "Wallace",
  "Chen",
  "Nguyen",
  "Ibrahim",
  "Crawford"
];

const OBJECTIVES = [
  "reinforce retirement income coverage",
  "evaluate liquidity ahead of tuition payments",
  "rebalance protection and accumulation needs",
  "prepare for executive compensation changes",
  "align estate intentions with new beneficiary designations"
];

const SUITABILITY_NOTES = [
  "Documented how recommendations support stated objective while honoring risk constraints.",
  "Captured rationale for product mix referencing the client's stated timeline and liquidity windows.",
  "Re-validated source of funds and ensured no conflict with existing workplace programs.",
  "Highlighted service model commitments and recorded disclosure acknowledgement in CRM.",
  "Outlined next steps for beneficiary updates and compliance review checkpoints."
];

const DISCLOSURE_LINES = [
  "Reviewed compensation differentials and logged acknowledgment before illustrations.",
  "Confirmed best-interest obligations and provided the current disclosure packet.",
  "Discussed potential conflicts and aligned on supervisory review cadence.",
  "Summarized Reg BI requirements and captured the client's questions in notes."
];

const RECORDKEEPING_LINES = [
  "Uploaded agenda and suitability worksheet to CRM within 2 hours.",
  "Tagged meeting artifacts for supervisory audit and follow-up.",
  "Attached e-sign consent and queued compliance checklist.",
  "Scheduled recordkeeping reminder and linked supporting documents."
];

function makeAdvisorId(index: number): string {
  return `adv-${index.toString().padStart(3, "0")}`;
}

function createAdvisor(rng: RNG, index: number): AdvisorSummary {
  const name = `${pickOne(rng, FIRST_NAMES)} ${pickOne(rng, LAST_NAMES)}`;
  const office = pickOne(rng, OFFICES);
  const tenure = pickOne(rng, ADVISOR_TENURE);
  const id = makeAdvisorId(index);
  return { id, name, office, tenure };
}

function generateClient(rng: RNG): ClientProfile {
  const ageBands: ClientProfile["ageBand"][] = ["18–25", "26–35", "36–50", "51–65"];
  return {
    ageBand: pickOne(rng, ageBands),
    dependents: randInt(rng, 0, 4),
    risk: pickOne(rng, RISK_BANDS),
    milestones: pickMany(rng, MILESTONE_LIBRARY, randInt(rng, 1, 2))
  };
}

function buildBriefNarrative(
  rng: RNG,
  advisor: AdvisorSummary,
  product: string,
  client: ClientProfile,
  topics: TopicKey[],
  timeAvailableMin: 15 | 30 | 60
): string {
  const discoveryFocus = pickOne(rng, OBJECTIVES);
  const suitability = pickOne(rng, SUITABILITY_NOTES);
  const disclosure = pickOne(rng, DISCLOSURE_LINES);
  const recordkeeping = pickOne(rng, RECORDKEEPING_LINES);

  const agenda = [
    `Warm recap and privacy reminder (${Math.min(5, Math.round(timeAvailableMin * 0.2))} min).`,
    `Discovery on ${discoveryFocus} (${Math.max(5, Math.round(timeAvailableMin * 0.35))} min).`,
    `Solution positioning around ${topics.join(", ")} with ${product} illustrations (${Math.max(6, Math.round(timeAvailableMin * 0.35))} min).`,
    `Next steps, disclosures, and CRM logging (${Math.max(4, Math.round(timeAvailableMin * 0.2))} min).`
  ].join(" ");

  const milestones = client.milestones.join("; ");

  return [
    `Agenda: ${agenda}`,
    `Client milestones: ${milestones}. Risk comfort is ${client.risk.toLowerCase()} with ${client.dependents} dependents.`,
    `Suitability narrative: ${suitability}`,
    `Disclosure conversation: ${disclosure}`,
    `Recordkeeping: ${recordkeeping}`
  ].join("\n");
}

function createFlags(forbidden: string[]): { text: string; reason: string; fix: string }[] {
  const suggestions: Record<string, string> = {
    guaranteed: "Use language like 'designed to' instead of guarantee claims.",
    assured: "Rephrase as 'positioned to' or 'expected to'.",
    "will outperform": "Describe disciplined approach rather than performance promises.",
    "no-risk": "Clarify protections without stating zero risk.",
    surefire: "Reference guardrails and supervision instead of certainty."
  };

  return forbidden.map((phrase) => ({
    text: phrase,
    reason: "Promissory language detected",
    fix: suggestions[phrase] ?? "Rephrase using neutral, compliance-reviewed language."
  }));
}

function injectForbiddenPhrases(rng: RNG, text: string): string {
  if (!chance(rng, 0.15)) return text;
  const phrases = { guaranteed: "guaranteed", assured: "assured", outperform: "will outperform", norisk: "no-risk" };
  const insert = pickOne(rng, Object.values(phrases));
  return `${text}\nPromissory language noted: ${insert} returns discussed informally.`;
}

interface UniverseOptions {
  seed: string;
  count: number;
}

export interface SyntheticUniverse {
  advisors: AdvisorSummary[];
  briefs: BriefRecord[];
  modules: TrainingModule[];
}

export function buildSyntheticUniverse({ seed, count }: UniverseOptions): SyntheticUniverse {
  const rng = createRng(seed);
  const advisorCount = Math.max(25, Math.floor(count / 6));
  const advisors: AdvisorSummary[] = Array.from({ length: advisorCount }, (_, idx) => createAdvisor(rng, idx + 1));

  const briefs: BriefRecord[] = [];
  for (let i = 0; i < count; i += 1) {
    const advisor = pickOne(rng, advisors);
    const product = pickOne(rng, PRODUCTS);
    const client = generateClient(rng);
    const timeAvailableMin = pickOne(rng, [15, 30, 60] as const);
    const baseTopics = pickMany(rng, ["suitability_objective", "risk_tolerance", "liquidity_needs", "time_horizon"] satisfies TopicKey[], 2);
    const optionalTopic = chance(rng, 0.6) ? pickOne(rng, ["conflict_disclosure", "recordkeeping"] as TopicKey[]) : undefined;
    const topics = optionalTopic ? Array.from(new Set([...baseTopics, optionalTopic])) : baseTopics;

    let briefText = buildBriefNarrative(rng, advisor, product, client, topics, timeAvailableMin);
    briefText = injectForbiddenPhrases(rng, briefText);

    const coverage: ComplianceCoverage = computeCoverageFromText(briefText, topics);
    const forbiddenMatches = detectForbiddenPhrases(briefText);
    const flags = createFlags(forbiddenMatches);
    const complianceIQ = weightedComplianceIQ(coverage, forbiddenMatches.length);
    const weakTopics = deriveWeakTopics(coverage, complianceIQ);
    const createdAt = new Date(Date.now() - randInt(rng, 0, 60) * 24 * 60 * 60 * 1000).toISOString();
    const approved = complianceIQ >= 72 && !flags.length ? true : chance(rng, 0.4);

    briefs.push({
      id: `brief-${i + 1}`,
      advisor,
      office: advisor.office,
      product,
      client,
      channel: pickOne(rng, CHANNELS),
      timeAvailableMin,
      briefText,
      topics,
      flags,
      coverage,
      complianceIQ,
      weakTopics,
      createdAt,
      approved,
      supervisorComment: approved ? undefined : chance(rng, 0.5) ? "Requested clearer liquidity rationale." : undefined
    });
  }

  return {
    advisors,
    briefs,
    modules: TRAINING_MODULES
  };
}

export function generateBriefSummary(brief: BriefRecord): string {
  return `${brief.advisor.name} | ${brief.product} | IQ ${brief.complianceIQ}`;
}

export function formatBriefDate(brief: BriefRecord): string {
  return format(new Date(brief.createdAt), "MMM d, yyyy");
}

export function computeVectorMap(briefs: BriefRecord[]): Record<string, [number, number]> {
  const map: Record<string, [number, number]> = {};
  briefs.forEach((brief) => {
    map[brief.id] = addVectorJitter(brief.id, vectorForTopics(brief.topics));
  });
  return map;
}

function addVectorJitter(id: string, vector: [number, number]): [number, number] {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10000;
  }
  const angle = ((hash % 360) * Math.PI) / 180;
  const magnitude = 0.2 + ((hash % 100) / 500);
  return [vector[0] + Math.cos(angle) * magnitude, vector[1] + Math.sin(angle) * magnitude];
}

export function createSyntheticBrief(
  seed: string,
  baseCount: number,
  existingBriefs: BriefRecord[]
): { brief: BriefRecord; advisors: AdvisorSummary[] } {
  const rng = createRng(`${seed}-${baseCount + existingBriefs.length}`);
  const existingAdvisors = Array.from(new Map(existingBriefs.map((b) => [b.advisor.id, b.advisor])).values());
  const advisor = chance(rng, 0.3) ? createAdvisor(rng, baseCount + existingAdvisors.length + 1) : pickOne(rng, existingAdvisors);
  const product = pickOne(rng, PRODUCTS);
  const client = generateClient(rng);
  const timeAvailableMin = pickOne(rng, [15, 30, 60] as const);
  const topics = pickMany(
    rng,
    ["suitability_objective", "risk_tolerance", "liquidity_needs", "time_horizon", "conflict_disclosure", "recordkeeping"] satisfies TopicKey[],
    randInt(rng, 2, 3)
  );
  let briefText = buildBriefNarrative(rng, advisor, product, client, topics, timeAvailableMin);
  briefText = injectForbiddenPhrases(rng, briefText);
  const coverage = computeCoverageFromText(briefText, topics);
  const forbiddenMatches = detectForbiddenPhrases(briefText);
  const flags = createFlags(forbiddenMatches);
  const complianceIQ = weightedComplianceIQ(coverage, forbiddenMatches.length);
  const weakTopics = deriveWeakTopics(coverage, complianceIQ);

  const brief: BriefRecord = {
    id: `brief-${baseCount + existingBriefs.length + 1}`,
    advisor,
    office: advisor.office,
    product,
    client,
    channel: pickOne(rng, CHANNELS),
    timeAvailableMin,
    briefText,
    topics,
    flags,
    coverage,
    complianceIQ,
    weakTopics,
    createdAt: new Date().toISOString(),
    approved: complianceIQ >= 75 && !flags.length,
    supervisorComment: undefined
  };

  return {
    brief,
    advisors: advisor ? [advisor] : []
  };
}

export interface BriefFormInput {
  office: Office;
  product: Product;
  advisor: AdvisorSummary;
  risk: RiskBand;
  ageBand: ClientProfile["ageBand"];
  dependents: number;
  milestones: string[];
  objective: string;
  channel: "In-Person" | "Virtual";
  timeAvailable: 15 | 30 | 60;
}

export function createBriefFromForm(
  seed: string,
  input: BriefFormInput,
  existingBriefs: BriefRecord[]
): BriefRecord {
  const rng = createRng(`${seed}-${existingBriefs.length + 1}-${input.advisor.id}`);
  const client: ClientProfile = {
    ageBand: input.ageBand,
    dependents: input.dependents,
    risk: input.risk,
    milestones: input.milestones.length ? input.milestones : pickMany(rng, MILESTONE_LIBRARY, 1)
  };
  const topics = pickMany(
    rng,
    ["suitability_objective", "risk_tolerance", "liquidity_needs", "time_horizon", "conflict_disclosure", "recordkeeping"] satisfies TopicKey[],
    3
  );
  let briefText = [
    `Agenda: Warm recap (${Math.min(5, Math.round(input.timeAvailable * 0.2))} min). Objective: ${input.objective}.` +
      ` Discovery on ${client.milestones.join(", ")} (${Math.max(5, Math.round(input.timeAvailable * 0.35))} min).` +
      ` Solution alignment for ${input.product} with ${topics.join(", ")} checkpoints (${Math.max(6, Math.round(input.timeAvailable * 0.35))} min).` +
      ` Next steps & disclosures (${Math.max(4, Math.round(input.timeAvailable * 0.2))} min).`,
    `Client risk posture ${client.risk.toLowerCase()} with ${client.dependents} dependents.`,
    `Suitability narrative: ${pickOne(rng, SUITABILITY_NOTES)}`,
    `Disclosure conversation: ${pickOne(rng, DISCLOSURE_LINES)}`,
    `Recordkeeping: ${pickOne(rng, RECORDKEEPING_LINES)}`
  ].join("\n");
  briefText = injectForbiddenPhrases(rng, briefText);
  const coverage = computeCoverageFromText(briefText, topics);
  const forbiddenMatches = detectForbiddenPhrases(briefText);
  const flags = createFlags(forbiddenMatches);
  const complianceIQ = weightedComplianceIQ(coverage, forbiddenMatches.length);
  const weakTopics = deriveWeakTopics(coverage, complianceIQ);

  return {
    id: `brief-${existingBriefs.length + 1}`,
    advisor: input.advisor,
    office: input.office,
    product: input.product,
    client,
    channel: input.channel,
    timeAvailableMin: input.timeAvailable,
    briefText,
    topics,
    flags,
    coverage,
    complianceIQ,
    weakTopics,
    createdAt: new Date().toISOString(),
    approved: complianceIQ >= 78 && !flags.length,
    supervisorComment: undefined
  };
}
