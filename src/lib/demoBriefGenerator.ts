import type { BriefData, ClientFormData, DataSignal, OpportunityPlay } from "@/types/brief";

const lifeStageByAge: Record<string, string> = {
  "25-35": "Emerging professional focused on foundation building",
  "36-50": "Growth-stage household balancing accumulation and protection",
  "51-65": "Pre-retiree preparing income continuity",
  "65+": "Retirement distribution and legacy planning stage"
};

const riskFocus: Record<string, string> = {
  Low: "capital preservation and downside protection",
  Moderate: "balanced growth with disciplined risk",
  High: "accelerated growth opportunities with transparent volatility management"
};

const discoveryQuestion = (goal: string) =>
  `How has your outlook on ${goal.toLowerCase()} evolved since our last conversation?`;

const parseDependents = (value: string) => {
  const numeric = parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildOpportunities = (formData: ClientFormData, lifeStage: string): OpportunityPlay[] => {
  const dependents = parseDependents(formData.dependents);
  const opportunities: OpportunityPlay[] = [
    {
      title: "Protection Gap Analysis",
      rationale: dependents > 0
        ? `Confirm that existing protection covers ${dependents} dependent${dependents === 1 ? "" : "s"} through critical milestones.`
        : "Quantify how income protection and emergency reserves support the client's primary goal.",
      impact: "Demonstrates a Reg BI-aligned rationale for any coverage adjustments before presenting illustrations."
    },
    {
      title: "Employer Benefit Optimization",
      rationale: formData.employerBenefits
        ? `Integrate ${formData.employerBenefits.toLowerCase()} into the holistic plan so recommendations don't conflict with workplace programs.`
        : "Capture missing employer benefit data to prevent conflicting recommendations and surface payroll-deduct options.",
      impact: "Creates a coordinated strategy that ties corporate benefits to NYL solutions and highlights measurable savings."
    }
  ];

  if (formData.meetingObjective === "Retirement Planning" || lifeStage.includes("Retiree")) {
    opportunities.push({
      title: "Guaranteed Income Story",
      rationale: "Model lifetime income scenarios using NYL annuity illustrations and stress test against longevity risk.",
      impact: "Positions NYL's protected income suite as differentiated versus generic market-return narratives."
    });
  } else if (formData.meetingObjective === "Investment Check-In") {
    opportunities.push({
      title: "Risk Budget Rebalance",
      rationale: `Translate the client's ${formData.riskComfort.toLowerCase()} risk score into updated asset allocation guardrails.`,
      impact: "Shows disciplined oversight by linking portfolio tweaks to NYL's supervised model portfolios."
    });
  }

  return opportunities;
};

const buildDataSignals = (formData: ClientFormData, lifeStage: string): DataSignal[] => {
  const dependents = parseDependents(formData.dependents);
  const signals: DataSignal[] = [
    {
      label: "Life Stage",
      insight: lifeStage,
      action: "Frame the conversation with NYL's life-stage playbook to confirm coverage and accumulation checkpoints."
    },
    {
      label: "Risk Posture",
      insight: `Client self-identifies as ${formData.riskComfort.toLowerCase()} risk comfort seeking ${riskFocus[formData.riskComfort]}.`,
      action: "Align product illustrations to the approved risk band and log rationale in Salesforce."
    },
    {
      label: "Meeting Channel",
      insight: `${formData.channel} session — leverage screen-sharing for disclosures and capture e-sign consent.`,
      action: "Use NYL digital meeting kit to record disclosure delivery and upload the recap automatically."
    }
  ];

  signals.push({
    label: "Household Dependencies",
    insight: dependents > 0
      ? `${dependents} dependent${dependents === 1 ? "" : "s"} increases protection priority and college planning needs.`
      : "No dependents reported — emphasize wealth accumulation milestones and beneficiary strategy.",
    action: dependents > 0
      ? "Quantify education and income replacement gaps with NYL needs analysis calculator."
      : "Explore charitable or legacy designations to reinforce value of NYL permanent life portfolio."
  });

  if (!formData.employerBenefits) {
    signals.push({
      label: "Data Gap",
      insight: "Employer benefits not captured yet.",
      action: "Assign pre-meeting task to confirm 401(k) match, group life, and HSA so recommendations avoid duplication."
    });
  }

  return signals;
};

export const generateBrief = (formData: ClientFormData): BriefData => {
  const lifeStage = lifeStageByAge[formData.ageRange] ?? "Client stage requires advisor confirmation";
  const dependents = parseDependents(formData.dependents);
  const meetingDuration = Math.max(15, parseInt(formData.timeAvailable, 10) || 30);
  const discoveryWindow = Math.max(5, Math.round(meetingDuration * 0.35));
  const solutionWindow = Math.max(6, Math.round(meetingDuration * 0.4));

  const agenda = [
    `Warm open and privacy reminder (${Math.min(5, Math.round(meetingDuration * 0.2))} min).`,
    `Recap progress toward ${formData.primaryGoal.toLowerCase()} with quick metrics (${Math.min(5, Math.round(meetingDuration * 0.2))} min).`,
    `Guided discovery on ${formData.milestones || "upcoming life events"} (${discoveryWindow} min).`,
    `Position NYL solutions emphasizing ${riskFocus[formData.riskComfort]} (${solutionWindow} min).`,
    `Agree on decisions, disclosures, and next steps (${Math.max(4, Math.round(meetingDuration * 0.2))} min).`
  ];

  const questions = [
    discoveryQuestion(formData.primaryGoal),
    formData.milestones
      ? `What support do you need from us as you navigate ${formData.milestones.toLowerCase()}?`
      : "Which life changes should we anticipate over the next 12-18 months?",
    formData.employerBenefits
      ? `How are you currently taking advantage of ${formData.employerBenefits.toLowerCase()} and where do you feel gaps remain?`
      : "Can we map out the benefits your employer offers so our recommendations complement what's already in place?",
    dependents > 0
      ? `If something unexpected happened tomorrow, how confident are you that your ${dependents} dependent${dependents === 1 ? "" : "s"} could stay on track?`
      : "What legacy or impact are you hoping your financial plan can deliver?"
  ];

  const compliance_hints = [
    `Document suitability rationale showing how recommendations support ${formData.primaryGoal.toLowerCase()} while honoring the client's ${formData.riskComfort.toLowerCase()} risk designation.`,
    `${formData.channel === "Virtual" ? "Confirm e-delivery consent and" : "Provide printed"} Reg BI disclosure and summarize key conflicts of interest before presenting products.`,
    dependents > 0
      ? "Highlight survivor benefit projections and note any assumptions used in needs analysis."
      : "Clarify beneficiary strategy and confirm the client understands liquidity trade-offs."
  ];

  const disclosure_stub = `New York Life representatives operate under a best-interest standard. Recommendations today are based on the information you provided about ${formData.primaryGoal.toLowerCase()} and your ${formData.riskComfort.toLowerCase()} risk comfort. Please review the disclosure packet delivered ${formData.channel === "Virtual" ? "via secure link" : "in print"} and let me know if anything needs clarification.`;

  const followups = [
    "Log meeting notes and suitability documentation in Salesforce within 24 hours.",
    "Trigger compliance checklist for any product illustrations shared during the meeting.",
    formData.employerBenefits
      ? "Sync employer benefit elections with NYL planning tools to prevent overlap."
      : "Schedule a data collection touchpoint to capture employer benefits and payroll deductions.",
    "Set reminder for next milestone review aligned with the agreed action plan."
  ];

  const opportunities = buildOpportunities(formData, lifeStage);
  const dataSignals = buildDataSignals(formData, lifeStage);

  const differentiators = [
    "Embedded NYL guardrails translate Reg BI, DFS 187, and company-specific compliance policies into advisor prompts — something generic LLMs don't surface automatically.",
    "Leverages structured client data (dependents, employer programs, time constraints) to auto-generate plays that map to NYL's field enablement journeys.",
    "Outputs Salesforce-ready follow-ups and telemetry so the activity is audit-ready without manual re-entry."
  ];

  const guardrails = [
    "Language filter blocks unapproved product claims and enforces use of NYL's compliance-reviewed phrases.",
    "Suitability checklist ensures risk tolerance, objectives, and financial situation are captured before presenting solutions.",
    "Meeting artifacts are tagged for supervisory review, giving compliance visibility into every AI-assisted recommendation."
  ];

  return {
    agenda,
    questions,
    compliance_hints,
    disclosure_stub,
    followups,
    opportunities,
    differentiators,
    guardrails,
    dataSignals
  };
};
