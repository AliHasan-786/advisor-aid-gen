export type Office = "Northeast" | "Southeast" | "Midwest" | "Southwest" | "West";
export type Product = "Term Life" | "Whole Life" | "Annuity" | "401k Rollover" | "College Savings";
export type RiskBand = "Low" | "Moderate" | "High";
export type AdvisorTenure = "novice" | "tenured" | "top";
export type TopicKey =
  | "suitability_objective"
  | "risk_tolerance"
  | "liquidity_needs"
  | "time_horizon"
  | "conflict_disclosure"
  | "recordkeeping";

export interface AdvisorSummary {
  id: string;
  name: string;
  tenure: AdvisorTenure;
  office: Office;
  escalated?: boolean;
  escalatedNote?: string;
}

export interface ClientProfile {
  ageBand: "18–25" | "26–35" | "36–50" | "51–65";
  dependents: number;
  risk: RiskBand;
  milestones: string[];
}

export interface ComplianceCoverage {
  suitability_objective: number;
  risk_tolerance: number;
  liquidity_needs: number;
  time_horizon: number;
  conflict_disclosure: number;
  recordkeeping: number;
}

export interface RedlineFlag {
  text: string;
  reason: string;
  fix: string;
}

export interface BriefRecord {
  id: string;
  advisor: AdvisorSummary;
  office: Office;
  product: Product;
  client: ClientProfile;
  channel: "In-Person" | "Virtual";
  timeAvailableMin: 15 | 30 | 60;
  briefText: string;
  topics: TopicKey[];
  flags: RedlineFlag[];
  coverage: ComplianceCoverage;
  complianceIQ: number;
  weakTopics: TopicKey[];
  createdAt: string;
  approved: boolean;
  supervisorComment?: string;
}

export interface TrainingModule {
  id: string;
  topic: TopicKey;
  title: string;
  durationMin: number;
  url: string;
  bullets: string[];
  scenarioQuestion: string;
  scenarioChoices: string[];
  answerIndex: number;
}

export interface FiltersState {
  offices: Office[];
  products: Product[];
  risks: RiskBand[];
  tenure: AdvisorTenure[];
  searchTerm: string;
  complianceRange: [number, number];
}

export interface MindshareStats {
  averageIQ: number;
  briefsVisible: number;
  topWeakTopic: TopicKey | null;
  flagsPerBrief: number;
}

export interface GraphNode {
  id: string;
  iq: number;
  topics: TopicKey[];
  weakTopics: TopicKey[];
  clusterKey: string;
  approved: boolean;
  vector: [number, number];
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

export interface AuditSnapshot {
  generatedAt: string;
  filters: FiltersState;
  topTopics: string[];
  topWeakTopics: string[];
  lowPerformers: { advisor: string; office: Office; iq: number }[];
  microLessonCounts: { assigned: number; completed: number };
  sampleRedlines: { advisor: string; before: string; after: string }[];
}
