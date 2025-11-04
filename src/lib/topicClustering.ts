import type { Brief, GraphNode, GraphLink } from '@/types/mindshare';

/**
 * Topic clustering and graph layout logic
 * 
 * This module handles:
 * 1. Creating topic vectors for briefs
 * 2. Computing similarity between briefs
 * 3. Building graph structure (nodes and links)
 * 4. Initial positioning of nodes in 2D space
 */

// Master topic list for vector embeddings
const ALL_TOPICS = [
  'suitability_objective',
  'risk_tolerance',
  'liquidity_needs',
  'time_horizon',
  'conflict_disclosure',
  'recordkeeping',
  'product_term_life',
  'product_whole_life',
  'product_annuity',
  'product_401k_rollover',
  'product_college_savings',
  'milestone_home',
  'milestone_college',
  'milestone_retirement',
  'milestone_divorce',
  'milestone_change',
  'milestone_business',
  'milestone_parents',
  'milestone_marriage',
  'milestone_baby',
  'milestone_inheritance',
  'milestone_renovation',
  'milestone_consolidation'
];

/**
 * Create a topic vector for a brief
 * Returns a normalized vector based on which topics are present
 */
export function createTopicVector(brief: Brief): number[] {
  const vector = ALL_TOPICS.map(topic => 
    brief.topics.includes(topic) ? 1 : 0
  );
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
}

/**
 * Calculate cosine similarity between two topic vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct; // Already normalized vectors
}

/**
 * Build graph structure from briefs
 * Creates nodes and links based on topic similarity
 */
export function buildGraphStructure(briefs: Brief[]): { nodes: GraphNode[]; links: GraphLink[] } {
  // Create nodes
  const nodes: GraphNode[] = briefs.map(brief => ({
    id: brief.id,
    brief
  }));

  // Create vectors for all briefs
  const vectors = briefs.map(createTopicVector);

  // Create links between similar briefs (top 3 nearest neighbors)
  const links: GraphLink[] = [];
  const seenPairs = new Set<string>();

  briefs.forEach((brief, i) => {
    // Calculate similarities to all other briefs
    const similarities: Array<{ index: number; similarity: number }> = [];
    
    for (let j = 0; j < briefs.length; j++) {
      if (i === j) continue;
      const similarity = cosineSimilarity(vectors[i], vectors[j]);
      similarities.push({ index: j, similarity });
    }

    // Sort by similarity and take top 3
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topNeighbors = similarities.slice(0, 3);

    // Create links to top neighbors
    topNeighbors.forEach(({ index, similarity }) => {
      if (similarity > 0.3) { // Minimum similarity threshold
        const pairKey = [brief.id, briefs[index].id].sort().join('-');
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          links.push({
            source: brief.id,
            target: briefs[index].id,
            similarity
          });
        }
      }
    });
  });

  return { nodes, links };
}

/**
 * Get node color based on cluster mode
 */
export function getNodeColor(brief: Brief, clusterMode: 'Topic' | 'Office' | 'Product'): string {
  switch (clusterMode) {
    case 'Office':
      const officeColors: Record<string, string> = {
        'Northeast': 'hsl(210, 100%, 56%)',
        'Southeast': 'hsl(142, 76%, 36%)',
        'Midwest': 'hsl(45, 93%, 47%)',
        'Southwest': 'hsl(25, 95%, 53%)',
        'West': 'hsl(280, 100%, 70%)'
      };
      return officeColors[brief.office] || 'hsl(0, 0%, 50%)';
    
    case 'Product':
      const productColors: Record<string, string> = {
        'Term Life': 'hsl(199, 89%, 48%)',
        'Whole Life': 'hsl(142, 71%, 45%)',
        'Annuity': 'hsl(262, 83%, 58%)',
        '401k Rollover': 'hsl(45, 93%, 47%)',
        'College Savings': 'hsl(340, 82%, 52%)'
      };
      return productColors[brief.product] || 'hsl(0, 0%, 50%)';
    
    case 'Topic':
    default:
      // Color by primary weak topic, or green if no weak topics
      if (brief.weakTopics.length === 0) {
        return 'hsl(142, 76%, 36%)'; // green - good
      }
      const topicColors: Record<string, string> = {
        'suitability_objective': 'hsl(0, 84%, 60%)',
        'risk_tolerance': 'hsl(25, 95%, 53%)',
        'liquidity_needs': 'hsl(45, 93%, 47%)',
        'time_horizon': 'hsl(199, 89%, 48%)',
        'conflict_disclosure': 'hsl(262, 83%, 58%)',
        'recordkeeping': 'hsl(340, 82%, 52%)'
      };
      return topicColors[brief.weakTopics[0]] || 'hsl(210, 100%, 56%)';
  }
}

/**
 * Get node size based on compliance IQ
 */
export function getNodeSize(brief: Brief): number {
  // Size from 4 to 12 based on IQ
  return 4 + (brief.complianceIQ / 100) * 8;
}

/**
 * Initial positioning of nodes in a circular layout
 * Force simulation will adjust from here
 */
export function initializeNodePositions(nodes: GraphNode[], clusterMode: 'Topic' | 'Office' | 'Product'): void {
  // Group nodes by cluster
  const clusters = new Map<string, GraphNode[]>();
  
  nodes.forEach(node => {
    let key: string;
    switch (clusterMode) {
      case 'Office':
        key = node.brief.office;
        break;
      case 'Product':
        key = node.brief.product;
        break;
      case 'Topic':
      default:
        key = node.brief.weakTopics[0] || 'none';
    }
    
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(node);
  });

  // Position each cluster in a circle
  const clusterKeys = Array.from(clusters.keys());
  const clusterCount = clusterKeys.length;
  const radius = 300;

  clusterKeys.forEach((key, clusterIndex) => {
    const angle = (clusterIndex / clusterCount) * 2 * Math.PI;
    const clusterX = Math.cos(angle) * radius;
    const clusterY = Math.sin(angle) * radius;
    
    const clusterNodes = clusters.get(key)!;
    const innerRadius = Math.sqrt(clusterNodes.length) * 10;
    
    clusterNodes.forEach((node, nodeIndex) => {
      const nodeAngle = (nodeIndex / clusterNodes.length) * 2 * Math.PI;
      node.x = clusterX + Math.cos(nodeAngle) * innerRadius;
      node.y = clusterY + Math.sin(nodeAngle) * innerRadius;
    });
  });
}
