import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, RefreshCw, Download, Plus } from 'lucide-react';
import { FilterPanel } from '@/components/mindshare/FilterPanel';
import { GraphCanvas } from '@/components/mindshare/GraphCanvas';
import { BriefDetailDrawer } from '@/components/mindshare/BriefDetailDrawer';
import { generateSyntheticBriefs } from '@/lib/syntheticData';
import { buildGraphStructure } from '@/lib/topicClustering';
import { calculateAggregateStats } from '@/lib/complianceScoring';
import { exportAuditReport } from '@/lib/exportUtils';
import type { Brief, Filters } from '@/types/mindshare';
import { useToast } from '@/hooks/use-toast';

const Mindshare = () => {
  const [allBriefs, setAllBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [supervisorView, setSupervisorView] = useState(false);
  const [clusterMode, setClusterMode] = useState<'Topic' | 'Office' | 'Product'>('Topic');
  const [seed, setSeed] = useState(12345);
  const { toast } = useToast();

  const [filters, setFilters] = useState<Filters>({
    offices: [],
    products: [],
    risks: [],
    tenures: [],
    complianceIQRange: [0, 100],
    searchTerm: ''
  });

  // Initialize data
  useEffect(() => {
    const briefs = generateSyntheticBriefs(200, seed);
    setAllBriefs(briefs);
    toast({
      title: 'Demo Mode Active',
      description: '200 synthetic briefs loaded. Synthetic data for demonstration only.'
    });
  }, [seed]);

  // Apply filters
  const filteredBriefs = allBriefs.filter(brief => {
    if (filters.offices.length > 0 && !filters.offices.includes(brief.office)) return false;
    if (filters.products.length > 0 && !filters.products.includes(brief.product)) return false;
    if (filters.risks.length > 0 && !filters.risks.includes(brief.client.risk)) return false;
    if (filters.tenures.length > 0 && !filters.tenures.includes(brief.advisor.tenure)) return false;
    if (brief.complianceIQ < filters.complianceIQRange[0] || brief.complianceIQ > filters.complianceIQRange[1]) return false;
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesAdvisor = brief.advisor.name.toLowerCase().includes(term);
      const matchesTopic = brief.topics.some(t => t.toLowerCase().includes(term));
      if (!matchesAdvisor && !matchesTopic) return false;
    }
    
    return true;
  });

  const stats = calculateAggregateStats(filteredBriefs);
  const { nodes, links } = buildGraphStructure(filteredBriefs);

  const handleRefreshDataset = () => {
    const newSeed = Date.now();
    setSeed(newSeed);
    toast({
      title: 'Dataset Refreshed',
      description: '200 new synthetic briefs generated with different scenarios.'
    });
  };

  const handleExport = () => {
    exportAuditReport(filteredBriefs, filters);
    toast({
      title: 'Audit Report Exported',
      description: 'PDF and JSON files have been downloaded.'
    });
  };

  const handleClearFilters = () => {
    setFilters({
      offices: [],
      products: [],
      risks: [],
      tenures: [],
      complianceIQRange: [0, 100],
      searchTerm: ''
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">Mindshare Map</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Demo Mode
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="supervisor-toggle" className="text-sm">Supervisor View</Label>
              <Switch
                id="supervisor-toggle"
                checked={supervisorView}
                onCheckedChange={setSupervisorView}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Cluster by:</Label>
              <div className="flex gap-1">
                {(['Topic', 'Office', 'Product'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={clusterMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClusterMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleRefreshDataset}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export Audit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          stats={stats}
        />

        <GraphCanvas
          nodes={nodes}
          links={links}
          clusterMode={clusterMode}
          onNodeClick={setSelectedBrief}
          onClearFilters={handleClearFilters}
        />

        {selectedBrief && (
          <BriefDetailDrawer
            brief={selectedBrief}
            onClose={() => setSelectedBrief(null)}
            supervisorView={supervisorView}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-muted-foreground border-t">
        Mindshare Map — AI-Governed Field Insight (Demo) • Synthetic Demo Data • Not affiliated with any real firm
      </footer>
    </div>
  );
};

export default Mindshare;
