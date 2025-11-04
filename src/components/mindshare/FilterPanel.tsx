import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Search } from 'lucide-react';
import type { Filters } from '@/types/mindshare';

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  stats: {
    avgComplianceIQ: number;
    totalBriefs: number;
    avgFlagsPerBrief: string;
    topWeakTopic: string;
  };
}

const OFFICES = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
const PRODUCTS = ['Term Life', 'Whole Life', 'Annuity', '401k Rollover', 'College Savings'];
const RISKS = ['Low', 'Moderate', 'High'];
const TENURES = ['novice', 'tenured', 'top'];

export function FilterPanel({ filters, onFiltersChange, stats }: FilterPanelProps) {
  const handleMultiSelectToggle = (category: 'offices' | 'products' | 'risks' | 'tenures', value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [category]: updated });
  };

  return (
    <div className="w-80 h-full overflow-y-auto bg-background border-r p-4 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs text-muted-foreground">Avg IQ</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-primary">{stats.avgComplianceIQ}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs text-muted-foreground">Briefs Visible</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-primary">{stats.totalBriefs}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 col-span-2">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs text-muted-foreground">Top Weak Topic</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-sm font-semibold">{stats.topWeakTopic}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 col-span-2">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs text-muted-foreground">Flags/Brief</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-primary">{stats.avgFlagsPerBrief}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Advisor name or topic..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Compliance IQ Range */}
      <div className="space-y-3">
        <Label>Compliance IQ Range</Label>
        <div className="px-2">
          <Slider
            min={0}
            max={100}
            step={5}
            value={[filters.complianceIQRange[0], filters.complianceIQRange[1]]}
            onValueChange={(values) =>
              onFiltersChange({ ...filters, complianceIQRange: [values[0], values[1]] })
            }
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filters.complianceIQRange[0]}</span>
          <span>{filters.complianceIQRange[1]}</span>
        </div>
      </div>

      {/* Office Filter */}
      <div className="space-y-2">
        <Label>Office</Label>
        <div className="space-y-2">
          {OFFICES.map(office => (
            <div key={office} className="flex items-center space-x-2">
              <Checkbox
                id={`office-${office}`}
                checked={filters.offices.includes(office)}
                onCheckedChange={() => handleMultiSelectToggle('offices', office)}
              />
              <label
                htmlFor={`office-${office}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {office}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Product Filter */}
      <div className="space-y-2">
        <Label>Product</Label>
        <div className="space-y-2">
          {PRODUCTS.map(product => (
            <div key={product} className="flex items-center space-x-2">
              <Checkbox
                id={`product-${product}`}
                checked={filters.products.includes(product)}
                onCheckedChange={() => handleMultiSelectToggle('products', product)}
              />
              <label
                htmlFor={`product-${product}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {product}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Filter */}
      <div className="space-y-2">
        <Label>Client Risk</Label>
        <div className="space-y-2">
          {RISKS.map(risk => (
            <div key={risk} className="flex items-center space-x-2">
              <Checkbox
                id={`risk-${risk}`}
                checked={filters.risks.includes(risk)}
                onCheckedChange={() => handleMultiSelectToggle('risks', risk)}
              />
              <label
                htmlFor={`risk-${risk}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {risk}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tenure Filter */}
      <div className="space-y-2">
        <Label>Advisor Tenure</Label>
        <div className="space-y-2">
          {TENURES.map(tenure => (
            <div key={tenure} className="flex items-center space-x-2">
              <Checkbox
                id={`tenure-${tenure}`}
                checked={filters.tenures.includes(tenure)}
                onCheckedChange={() => handleMultiSelectToggle('tenures', tenure)}
              />
              <label
                htmlFor={`tenure-${tenure}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
              >
                {tenure}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
