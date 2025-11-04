export interface Brief {
  id: string;
  advisor: {
    id: string;
    name: string;
    tenure: 'novice' | 'tenured' | 'top';
  };
  office: 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West';
  product: 'Term Life' | 'Whole Life' | 'Annuity' | '401k Rollover' | 'College Savings';
  client: {
    ageBand: '18-25' | '26-35' | '36-50' | '51-65';
    dependents: number;
    risk: 'Low' | 'Moderate' | 'High';
    milestones: string[];
  };
  channel: 'In-Person' | 'Virtual';
  timeAvailableMin: 15 | 30 | 60;
  briefText: string;
  topics: string[];
  flags: { text: string; reason: string; fix: string }[];
  coverage: {
    suitability_objective: number;
    risk_tolerance: number;
    liquidity_needs: number;
    time_horizon: number;
    conflict_disclosure: number;
    recordkeeping: number;
  };
  complianceIQ: number;
  weakTopics: string[];
  createdAt: string;
  approved: boolean;
  supervisorComment?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface TrainingModule {
  id: string;
  topic: string;
  title: string;
  durationMin: number;
  learningPoints: string[];
  scenario: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
}

export interface TrainingCompletion {
  advisorId: string;
  moduleId: string;
  completedAt: string;
}

export interface GraphNode {
  id: string;
  brief: Brief;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  similarity: number;
}

export interface Filters {
  offices: string[];
  products: string[];
  risks: string[];
  tenures: string[];
  complianceIQRange: [number, number];
  searchTerm: string;
}

export const FORBIDDEN_PHRASES = [
  'guaranteed',
  'assured',
  'will outperform',
  'no-risk',
  'surefire',
  'can\'t lose',
  'always profitable',
  'zero risk',
  'guaranteed returns',
  'risk-free'
];

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'tm-1',
    topic: 'suitability_objective',
    title: 'Documenting Client Objectives',
    durationMin: 5,
    learningPoints: [
      'Always document the client\'s primary financial objective in their own words',
      'Link product recommendations directly to stated objectives',
      'Revisit objectives at each meeting to track evolution',
      'Use objective-based language in all suitability documentation'
    ],
    scenario: {
      question: 'A client says they want to "save for retirement." What is the BEST follow-up question?',
      options: [
        'Would you like to see our annuity brochure?',
        'What age do you envision retiring, and what lifestyle do you want?',
        'Our 401k rollover is perfect for that.',
        'Have you maxed out your IRA contributions?'
      ],
      correctAnswer: 1
    }
  },
  {
    id: 'tm-2',
    topic: 'risk_tolerance',
    title: 'Risk Assessment Best Practices',
    durationMin: 6,
    learningPoints: [
      'Use a standardized risk tolerance questionnaire',
      'Document both capacity and willingness to take risk',
      'Explain how product features align with risk profile',
      'Update risk assessment annually or after major life events'
    ],
    scenario: {
      question: 'A client marks "high risk tolerance" but mentions they need the money in 3 years. What should you do?',
      options: [
        'Proceed with high-risk investments as requested',
        'Discuss the conflict between time horizon and risk capacity',
        'Recommend a 401k rollover',
        'Skip the risk assessment'
      ],
      correctAnswer: 1
    }
  },
  {
    id: 'tm-3',
    topic: 'liquidity_needs',
    title: 'Understanding Liquidity Requirements',
    durationMin: 4,
    learningPoints: [
      'Quantify emergency fund needs (typically 3-6 months expenses)',
      'Identify upcoming large expenses in the next 3-5 years',
      'Match product liquidity features to client timelines',
      'Explain surrender charges and access penalties clearly'
    ],
    scenario: {
      question: 'Which statement BEST explains liquidity to a client?',
      options: [
        'Liquidity means your money grows faster',
        'Liquidity is how quickly you can access funds without penalties',
        'All our products are highly liquid',
        'Liquidity is not important for retirement planning'
      ],
      correctAnswer: 1
    }
  },
  {
    id: 'tm-4',
    topic: 'time_horizon',
    title: 'Time Horizon Analysis',
    durationMin: 5,
    learningPoints: [
      'Establish clear timelines for each financial goal',
      'Match product features to time horizons',
      'Document how time horizon influenced recommendations',
      'Review and adjust as circumstances change'
    ],
    scenario: {
      question: 'A 28-year-old wants to save for a house down payment in 2 years. Best approach?',
      options: [
        'Whole life insurance with cash value accumulation',
        'High-yield savings or short-term bonds',
        'Aggressive stock portfolio',
        'Long-term annuity'
      ],
      correctAnswer: 1
    }
  },
  {
    id: 'tm-5',
    topic: 'conflict_disclosure',
    title: 'Conflict of Interest Disclosure',
    durationMin: 7,
    learningPoints: [
      'Proactively disclose all material conflicts before recommendations',
      'Explain compensation structure in plain language',
      'Document that disclosure was provided and understood',
      'Provide written disclosure documents and confirm receipt'
    ],
    scenario: {
      question: 'When should you disclose that you earn higher commission on Product A vs Product B?',
      options: [
        'After the client makes a decision',
        'Only if the client asks',
        'Before presenting any product recommendations',
        'It\'s not necessary if both are suitable'
      ],
      correctAnswer: 2
    }
  },
  {
    id: 'tm-6',
    topic: 'recordkeeping',
    title: 'Compliant Documentation Practices',
    durationMin: 6,
    learningPoints: [
      'Document all client interactions within 24 hours',
      'Include objective facts, not subjective interpretations',
      'Store records according to retention policies (typically 6+ years)',
      'Ensure documentation supports suitability determinations'
    ],
    scenario: {
      question: 'What is the PRIMARY purpose of detailed meeting notes?',
      options: [
        'To remember what the client said',
        'To demonstrate regulatory compliance and suitability rationale',
        'To share with other team members',
        'To track sales quotas'
      ],
      correctAnswer: 1
    }
  }
];
