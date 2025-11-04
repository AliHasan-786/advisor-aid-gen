import { useEffect, useRef, useState } from 'react';
import type { Brief, GraphNode, GraphLink } from '@/types/mindshare';
import { getNodeColor, getNodeSize } from '@/lib/topicClustering';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  clusterMode: 'Topic' | 'Office' | 'Product';
  onNodeClick: (brief: Brief) => void;
  onClearFilters: () => void;
}

export function GraphCanvas({ nodes, links, clusterMode, onNodeClick, onClearFilters }: GraphCanvasProps) {
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Empty state
  if (nodes.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 flex items-center justify-center bg-secondary/20">
        <Card className="max-w-md p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No Briefs Match Current Filters</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more data, or clear all filters to start fresh.
          </p>
          <Button onClick={onClearFilters}>Clear All Filters</Button>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 relative bg-secondary/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Force-Directed Graph</h3>
          <p className="text-sm text-muted-foreground">
            Showing {nodes.length} briefs clustered by {clusterMode}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            (Force graph visualization will be implemented with d3-force)
          </p>
        </Card>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/95 border rounded-lg p-3 space-y-2 text-xs">
        <div className="font-semibold mb-2">Legend ({clusterMode})</div>
        {clusterMode === 'Topic' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
              <span>No weak topics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
              <span>Weak: suitability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(262, 83%, 58%)' }} />
              <span>Weak: disclosure</span>
            </div>
          </>
        )}
        {clusterMode === 'Office' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(210, 100%, 56%)' }} />
              <span>Northeast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
              <span>Southeast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(45, 93%, 47%)' }} />
              <span>Midwest</span>
            </div>
          </>
        )}
        {clusterMode === 'Product' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(199, 89%, 48%)' }} />
              <span>Term Life</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
              <span>Whole Life</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(262, 83%, 58%)' }} />
              <span>Annuity</span>
            </div>
          </>
        )}
        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-red-500" />
            <span>Unapproved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
