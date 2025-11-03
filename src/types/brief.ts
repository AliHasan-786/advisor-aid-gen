export interface ClientFormData {
  ageRange: string;
  primaryGoal: string;
  milestones: string;
  dependents: string;
  employerBenefits: string;
  riskComfort: string;
  meetingObjective: string;
  channel: string;
  timeAvailable: string;
}

export interface OpportunityPlay {
  title: string;
  rationale: string;
  impact: string;
}

export interface DataSignal {
  label: string;
  insight: string;
  action: string;
}

export interface BriefData {
  agenda: string[];
  questions: string[];
  compliance_hints: string[];
  disclosure_stub: string;
  followups: string[];
  opportunities: OpportunityPlay[];
  differentiators: string[];
  guardrails: string[];
  dataSignals: DataSignal[];
}
