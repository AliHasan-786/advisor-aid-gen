import type { Brief } from '@/types/mindshare';
import { FORBIDDEN_PHRASES } from '@/types/mindshare';

// Seeded random number generator for deterministic data
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: readonly T[]): T {
    return array[Math.floor(this.next() * array.length)] as T;
  }

  sample<T>(array: readonly T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}

const ADVISOR_FIRST_NAMES = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Jessica', 'Robert', 'Emily', 'James',
  'Ashley', 'Christopher', 'Amanda', 'Matthew', 'Melissa', 'Daniel', 'Stephanie',
  'Andrew', 'Nicole', 'Joseph', 'Elizabeth', 'Ryan', 'Lauren', 'Brian', 'Rachel'
];

const ADVISOR_LAST_NAMES = [
  'Anderson', 'Thompson', 'Martinez', 'Garcia', 'Wilson', 'Taylor', 'Brown',
  'Johnson', 'Williams', 'Jones', 'Davis', 'Miller', 'Moore', 'Jackson', 'Lee',
  'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King'
];

const MILESTONES = [
  'buying first home',
  'sending child to college',
  'retirement planning',
  'recent divorce settlement',
  'career change',
  'starting a business',
  'caring for aging parents',
  'marriage',
  'new baby',
  'inheritance received',
  'home renovation',
  'debt consolidation'
];

const OFFICES = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'] as const;
const PRODUCTS = ['Term Life', 'Whole Life', 'Annuity', '401k Rollover', 'College Savings'] as const;
const AGE_BANDS = ['18-25', '26-35', '36-50', '51-65'] as const;
const RISKS = ['Low', 'Moderate', 'High'] as const;
const TENURES = ['novice', 'tenured', 'top'] as const;
const CHANNELS = ['In-Person', 'Virtual'] as const;
const TIME_OPTIONS = [15, 30, 60] as const;

export function generateSyntheticBriefs(count: number, seed: number = 12345): Brief[] {
  const rng = new SeededRandom(seed);
  const briefs: Brief[] = [];
  const usedAdvisorIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Generate unique advisor
    let advisorId: string;
    let advisorName: string;
    do {
      const firstName = rng.choice(ADVISOR_FIRST_NAMES);
      const lastName = rng.choice(ADVISOR_LAST_NAMES);
      advisorName = `${firstName} ${lastName}`;
      advisorId = `adv-${advisorName.toLowerCase().replace(' ', '-')}-${rng.nextInt(100, 999)}`;
    } while (usedAdvisorIds.has(advisorId) && usedAdvisorIds.size < count * 0.3);
    usedAdvisorIds.add(advisorId);

    const tenure = rng.choice(TENURES);
    const office = rng.choice(OFFICES);
    const product = rng.choice(PRODUCTS);
    const ageBand = rng.choice(AGE_BANDS);
    const dependents = rng.nextInt(0, 4);
    const risk = rng.choice(RISKS);
    const milestones = rng.sample(MILESTONES, rng.nextInt(1, 3));
    const channel = rng.choice(CHANNELS);
    const timeAvailableMin = rng.choice(TIME_OPTIONS);

    const brief = generateBrief(rng, {
      advisorId,
      advisorName,
      tenure,
      office,
      product,
      ageBand,
      dependents,
      risk,
      milestones,
      channel,
      timeAvailableMin
    });

    briefs.push(brief);
  }

  return briefs;
}

interface BriefParams {
  advisorId: string;
  advisorName: string;
  tenure: typeof TENURES[number];
  office: typeof OFFICES[number];
  product: typeof PRODUCTS[number];
  ageBand: typeof AGE_BANDS[number];
  dependents: number;
  risk: typeof RISKS[number];
  milestones: string[];
  channel: typeof CHANNELS[number];
  timeAvailableMin: typeof TIME_OPTIONS[number];
}

function generateBrief(rng: SeededRandom, params: BriefParams): Brief {
  const {
    advisorId,
    advisorName,
    tenure,
    office,
    product,
    ageBand,
    dependents,
    risk,
    milestones,
    channel,
    timeAvailableMin
  } = params;

  // Generate brief text with varying quality based on tenure
  const briefText = generateBriefText(rng, params);
  
  // Extract topics from the brief
  const topics = extractTopics(briefText, product, milestones);
  
  // Scan for forbidden phrases
  const flags = scanForForbiddenPhrases(briefText);
  
  // Calculate coverage based on tenure and brief quality
  const coverage = calculateCoverage(rng, tenure, briefText, topics);
  
  // Calculate compliance IQ
  const complianceIQ = calculateComplianceIQ(coverage, flags.length);
  
  // Identify weak topics
  const weakTopics = Object.entries(coverage)
    .filter(([_, score]) => score < 0.6)
    .map(([topic]) => topic);

  // Random approval status
  const approved = rng.next() > 0.3; // 70% approved

  const brief: Brief = {
    id: `brief-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    advisor: {
      id: advisorId,
      name: advisorName,
      tenure
    },
    office,
    product,
    client: {
      ageBand,
      dependents,
      risk,
      milestones
    },
    channel,
    timeAvailableMin,
    briefText,
    topics,
    flags,
    coverage,
    complianceIQ,
    weakTopics,
    createdAt: new Date(Date.now() - rng.nextInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
    approved,
    supervisorComment: !approved && rng.next() > 0.5 ? generateSupervisorComment(rng, weakTopics) : undefined
  };

  return brief;
}

function generateBriefText(rng: SeededRandom, params: BriefParams): string {
  const { tenure, product, ageBand, dependents, risk, milestones, timeAvailableMin, channel } = params;
  
  // Base quality on tenure - novice advisors make more mistakes
  const qualityFactor = tenure === 'top' ? 0.95 : tenure === 'tenured' ? 0.80 : 0.60;
  const includeRiskyPhrase = rng.next() > (qualityFactor + 0.05);
  
  let text = `Meeting Agenda (${timeAvailableMin} min, ${channel}):\n\n`;
  
  // Opening
  text += `1. Welcome and Privacy Notice (3 min)\n`;
  text += `   - Reviewed client information privacy policies\n`;
  if (rng.next() < qualityFactor) {
    text += `   - Confirmed best interest standard under Reg BI\n`;
  }
  
  // Discovery
  text += `\n2. Client Situation Review (${Math.floor(timeAvailableMin * 0.3)} min)\n`;
  text += `   - Client age band: ${ageBand}, Dependents: ${dependents}\n`;
  text += `   - Risk comfort level: ${risk}\n`;
  text += `   - Current life milestone: ${milestones.join(', ')}\n`;
  
  // Objectives
  text += `\n3. Financial Objectives Discussion (${Math.floor(timeAvailableMin * 0.25)} min)\n`;
  if (rng.next() < qualityFactor) {
    text += `   - Documented primary objective: ${getObjectiveByProduct(product)}\n`;
    text += `   - Discussed time horizon and liquidity needs\n`;
  } else {
    text += `   - General discussion about ${product.toLowerCase()} options\n`;
  }
  
  // Solution presentation
  text += `\n4. ${product} Solution Presentation (${Math.floor(timeAvailableMin * 0.3)} min)\n`;
  if (includeRiskyPhrase && tenure === 'novice') {
    const riskyPhrase = rng.choice(FORBIDDEN_PHRASES);
    text += `   - Presented ${product} as ${riskyPhrase} solution for client goals\n`;
  } else {
    text += `   - Presented ${product} features aligned with client risk tolerance\n`;
  }
  text += `   - Reviewed product costs, fees, and surrender charges\n`;
  
  if (rng.next() < qualityFactor) {
    text += `   - Discussed alternative products and rationale for recommendation\n`;
  }
  
  // Disclosures
  text += `\n5. Disclosures and Next Steps (${Math.floor(timeAvailableMin * 0.15)} min)\n`;
  if (rng.next() < qualityFactor) {
    text += `   - Provided Reg BI Form CRS disclosure\n`;
    text += `   - Explained compensation structure and potential conflicts\n`;
    text += `   - Client acknowledged understanding of material disclosures\n`;
  } else {
    text += `   - Provided disclosure materials\n`;
  }
  
  // Suitability narrative
  text += `\n\nSuitability Determination:\n`;
  if (rng.next() < qualityFactor) {
    text += `This ${product} recommendation is suitable based on:\n`;
    text += `- Client's stated objective of ${getObjectiveByProduct(product).toLowerCase()}\n`;
    text += `- ${risk} risk tolerance aligns with product risk profile\n`;
    text += `- Time horizon of ${getTimeHorizonByAge(ageBand)} appropriate for product features\n`;
    if (dependents > 0) {
      text += `- Protection needs for ${dependents} dependent(s) addressed\n`;
    }
    text += `- Client has adequate liquidity reserves for emergency needs\n`;
    text += `- Product costs and limitations clearly explained and understood\n`;
  } else {
    text += `Client expressed interest in ${product}. Product seems appropriate for situation.\n`;
  }
  
  // Recordkeeping
  if (rng.next() < qualityFactor) {
    text += `\nRecordkeeping:\n`;
    text += `- Meeting notes and disclosures uploaded to client file\n`;
    text += `- Suitability checklist completed and approved\n`;
    text += `- Follow-up scheduled for ${rng.nextInt(3, 12)} months\n`;
  }
  
  return text;
}

function getObjectiveByProduct(product: string): string {
  const objectives: Record<string, string> = {
    'Term Life': 'Income protection for family',
    'Whole Life': 'Permanent coverage with cash value accumulation',
    'Annuity': 'Guaranteed retirement income',
    '401k Rollover': 'Retirement savings consolidation',
    'College Savings': 'Education funding for children'
  };
  return objectives[product] || 'Financial security';
}

function getTimeHorizonByAge(ageBand: string): string {
  const horizons: Record<string, string> = {
    '18-25': '30+ years',
    '26-35': '20-30 years',
    '36-50': '10-20 years',
    '51-65': '5-15 years'
  };
  return horizons[ageBand] || '10+ years';
}

function extractTopics(briefText: string, product: string, milestones: string[]): string[] {
  const topics: Set<string> = new Set();
  const lowerText = briefText.toLowerCase();
  
  // Topic keyword mapping
  const topicMap: Record<string, string[]> = {
    'suitability_objective': ['objective', 'goal', 'suitable', 'suitability', 'purpose'],
    'risk_tolerance': ['risk', 'tolerance', 'comfort', 'volatility', 'conservative', 'aggressive'],
    'liquidity_needs': ['liquidity', 'access', 'emergency', 'reserves', 'surrender charge'],
    'time_horizon': ['time horizon', 'timeline', 'years', 'short-term', 'long-term'],
    'conflict_disclosure': ['disclosure', 'conflict', 'compensation', 'commission', 'form crs', 'reg bi'],
    'recordkeeping': ['recordkeeping', 'documentation', 'notes', 'file', 'uploaded', 'checklist']
  };
  
  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.add(topic);
    }
  }
  
  // Add product-specific topics
  topics.add(`product_${product.toLowerCase().replace(/\s+/g, '_')}`);
  
  // Add milestone topics
  milestones.forEach(milestone => {
    topics.add(`milestone_${milestone.split(' ').slice(-1)[0]}`);
  });
  
  return Array.from(topics);
}

function scanForForbiddenPhrases(briefText: string): Array<{ text: string; reason: string; fix: string }> {
  const flags: Array<{ text: string; reason: string; fix: string }> = [];
  const lowerText = briefText.toLowerCase();
  
  const phraseFixes: Record<string, { reason: string; fix: string }> = {
    'guaranteed': {
      reason: 'Implies certainty where none exists; violates suitability standards',
      fix: 'designed to provide'
    },
    'assured': {
      reason: 'Overpromises outcomes; creates unrealistic client expectations',
      fix: 'intended to help achieve'
    },
    'will outperform': {
      reason: 'Makes performance predictions; prohibited by compliance policy',
      fix: 'has historically performed competitively'
    },
    'no-risk': {
      reason: 'Misrepresents product risk profile; all investments carry risk',
      fix: 'designed to help manage risk'
    },
    'surefire': {
      reason: 'Guarantees success; creates liability and client disappointment',
      fix: 'carefully structured to support'
    },
    'can\'t lose': {
      reason: 'False promise; even conservative products have risk factors',
      fix: 'designed with safeguards to help protect'
    },
    'always profitable': {
      reason: 'Impossible guarantee; violates truth in advertising',
      fix: 'structured to pursue growth opportunities'
    },
    'zero risk': {
      reason: 'Misrepresents fundamental investment principles',
      fix: 'designed to help mitigate market volatility'
    },
    'guaranteed returns': {
      reason: 'Only acceptable if referring to contractual guarantees in specific products',
      fix: 'potential for returns'
    },
    'risk-free': {
      reason: 'No product is entirely risk-free; misleading to clients',
      fix: 'designed to help mitigate risk'
    }
  };
  
  for (const [phrase, { reason, fix }] of Object.entries(phraseFixes)) {
    if (lowerText.includes(phrase.toLowerCase())) {
      flags.push({
        text: phrase,
        reason,
        fix
      });
    }
  }
  
  return flags;
}

function calculateCoverage(
  rng: SeededRandom,
  tenure: string,
  briefText: string,
  topics: string[]
): Brief['coverage'] {
  // Base coverage on tenure quality
  const baseQuality = tenure === 'top' ? 0.85 : tenure === 'tenured' ? 0.70 : 0.50;
  const variance = 0.15;
  
  const coverage: Brief['coverage'] = {
    suitability_objective: 0,
    risk_tolerance: 0,
    liquidity_needs: 0,
    time_horizon: 0,
    conflict_disclosure: 0,
    recordkeeping: 0
  };
  
  // Calculate each dimension based on text content and topics
  for (const dimension of Object.keys(coverage) as Array<keyof Brief['coverage']>) {
    const hasTopic = topics.includes(dimension);
    const hasKeywordDensity = briefText.toLowerCase().split(dimension.replace(/_/g, ' ')).length > 1;
    
    let score = baseQuality + (rng.next() * variance * 2 - variance);
    if (hasTopic) score += 0.1;
    if (hasKeywordDensity) score += 0.05;
    
    coverage[dimension] = Math.max(0, Math.min(1, score));
  }
  
  return coverage;
}

function calculateComplianceIQ(coverage: Brief['coverage'], flagCount: number): number {
  // Weighted sum of coverage dimensions
  const weights = {
    suitability_objective: 0.18,
    risk_tolerance: 0.18,
    liquidity_needs: 0.14,
    time_horizon: 0.14,
    conflict_disclosure: 0.18,
    recordkeeping: 0.18
  };
  
  let iq = 0;
  for (const [dimension, weight] of Object.entries(weights)) {
    iq += coverage[dimension as keyof Brief['coverage']] * weight;
  }
  
  // Convert to 0-100 scale
  iq *= 100;
  
  // Deduct points for flags (max -10)
  iq -= Math.min(flagCount * 2, 10);
  
  return Math.max(0, Math.min(100, Math.round(iq)));
}

function generateSupervisorComment(rng: SeededRandom, weakTopics: string[]): string {
  const comments = [
    `Please strengthen documentation around ${weakTopics[0]?.replace(/_/g, ' ')} before final approval.`,
    `Good start, but need more detail on ${weakTopics.slice(0, 2).map(t => t.replace(/_/g, ' ')).join(' and ')}.`,
    `Revise to include specific discussion of ${weakTopics[0]?.replace(/_/g, ' ')} requirements.`,
    `Meeting the minimum bar, but let's elevate quality on ${weakTopics[0]?.replace(/_/g, ' ')}.`
  ];
  return rng.choice(comments);
}
