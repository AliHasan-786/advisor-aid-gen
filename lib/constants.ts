import type { Office, Product, RiskBand, AdvisorTenure, TopicKey, TrainingModule } from "@/lib/types";

export const OFFICES: Office[] = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];
export const PRODUCTS: Product[] = ["Term Life", "Whole Life", "Annuity", "401k Rollover", "College Savings"];
export const RISK_BANDS: RiskBand[] = ["Low", "Moderate", "High"];
export const ADVISOR_TENURE: AdvisorTenure[] = ["novice", "tenured", "top"];
export const CHANNELS: Array<"In-Person" | "Virtual"> = ["In-Person", "Virtual"];
export const MILESTONE_LIBRARY = [
  "recent home purchase",
  "college planning",
  "retirement transition",
  "new child",
  "divorce settlement",
  "inheritance event",
  "small business launch",
  "aging parent care"
];

export const FORBIDDEN_PHRASES = ["guaranteed", "assured", "will outperform", "no-risk", "surefire"];

export const TOPIC_KEYWORDS: Record<TopicKey, string[]> = {
  suitability_objective: ["objective", "recommendation", "goal", "purpose", "align"],
  risk_tolerance: ["risk", "comfort", "volatility", "tolerance", "drawdown"],
  liquidity_needs: ["liquidity", "cash", "emergency", "reserve", "access"],
  time_horizon: ["horizon", "timeline", "years", "milestone", "long-term"],
  conflict_disclosure: ["conflict", "disclosure", "compensation", "best interest", "reg bi"],
  recordkeeping: ["document", "log", "crm", "audit", "record"]
};

export const TOPIC_VECTORS: Record<TopicKey, [number, number]> = {
  suitability_objective: [0.9, 0.2],
  risk_tolerance: [0.1, 0.8],
  liquidity_needs: [-0.7, 0.4],
  time_horizon: [0.6, -0.5],
  conflict_disclosure: [-0.2, -0.8],
  recordkeeping: [-0.8, -0.2]
};

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "mod-risk-discussion",
    topic: "risk_tolerance",
    title: "Guiding Risk Tolerance Dialogues",
    durationMin: 6,
    url: "/training/risk",
    bullets: [
      "Frame market scenarios with plain-language benchmarks",
      "Document verbal risk cues inside the CRM template",
      "Connect risk comfort directly to solution positioning"
    ],
    scenarioQuestion: "Client says they are \"comfortable with some risk\" while also fearing losses. What is your best next step?",
    scenarioChoices: [
      "Move forward with growth model to build confidence",
      "Clarify loss thresholds and translate into allocation bands",
      "Shift immediately to capital preservation products"
    ],
    answerIndex: 1
  },
  {
    id: "mod-liquidity",
    topic: "liquidity_needs",
    title: "Liquidity First Playbook",
    durationMin: 5,
    url: "/training/liquidity",
    bullets: [
      "Assess cash runway and known short-term obligations",
      "Surface hidden liquidity needs like tuition or caregiving",
      "Tie liquidity recommendations to compliance guardrails"
    ],
    scenarioQuestion: "Household has limited cash reserves and upcoming tuition. What do you log?",
    scenarioChoices: [
      "Note that tuition is outside advisory scope",
      "Document the tuition milestone and adjust liquidity coverage",
      "Focus on retirement assets only"
    ],
    answerIndex: 1
  },
  {
    id: "mod-time-horizon",
    topic: "time_horizon",
    title: "Framing Time Horizons Clearly",
    durationMin: 5,
    url: "/training/time",
    bullets: [
      "Map each goal to a specific timeline band",
      "Use our visual timeline tool during discovery",
      "Confirm horizon alignment before any illustrations"
    ],
    scenarioQuestion: "Client’s retirement is 12 years out. Which wording documents horizon?",
    scenarioChoices: [
      "Retirement soon, present annuity",
      "Retirement targeted 12-year horizon, validate with client",
      "Horizon not discussed"
    ],
    answerIndex: 1
  },
  {
    id: "mod-conflict",
    topic: "conflict_disclosure",
    title: "Conflict Transparency Essentials",
    durationMin: 7,
    url: "/training/conflict",
    bullets: [
      "Deliver the standard disclosure packet every meeting",
      "Explain compensation differentials calmly and clearly",
      "Capture client acknowledgement in the CRM log"
    ],
    scenarioQuestion: "When must conflict language be logged?",
    scenarioChoices: [
      "Only when selling proprietary products",
      "Every recommendation meeting with summary in CRM",
      "Only during annual reviews"
    ],
    answerIndex: 1
  },
  {
    id: "mod-recordkeeping",
    topic: "recordkeeping",
    title: "Audit-Proof Recordkeeping",
    durationMin: 6,
    url: "/training/records",
    bullets: [
      "Upload notes and suitability rationale within 24 hours",
      "Tag attachments with meeting objective and date",
      "Capture electronic signatures for virtual sessions"
    ],
    scenarioQuestion: "Virtual meeting concluded with e-sign. What is required?",
    scenarioChoices: [
      "No action if platform recorded the session",
      "Log disclosure delivery and attach consent receipt",
      "Only email supervisor"
    ],
    answerIndex: 1
  }
];
