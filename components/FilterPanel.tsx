"use client";

import { ChangeEvent } from "react";
import clsx from "clsx";
import { useMindshare } from "@/components/MindshareProvider";
import { ADVISOR_TENURE, OFFICES, PRODUCTS, RISK_BANDS } from "@/lib/constants";
import type { FiltersState } from "@/lib/types";

function CheckboxList<T extends string>({
  title,
  items,
  selected,
  onToggle
}: {
  title: string;
  items: ReadonlyArray<T>;
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

const FILTER_KEYS = ["offices", "products", "risks", "tenure"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export function FilterPanel() {
  const { filters, setFilters, resetFilters, stats, filteredBriefs } = useMindshare();

  const toggleValue = <K extends FilterKey>(key: K, value: FiltersState[K][number]) => {
    const set = new Set(filters[key]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setFilters({ ...filters, [key]: Array.from(set) as FiltersState[K] });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: event.target.value });
  };

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const range: [number, number] = [...filters.complianceRange] as [number, number];
    range[index] = Number(event.target.value);
    if (range[0] > range[1]) {
      if (index === 0) range[1] = range[0];
      else range[0] = range[1];
    }
    setFilters({ ...filters, complianceRange: range });
  };

  return (
    <aside className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-card lg:w-72 lg:flex-none">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Avg Compliance IQ</p>
          <p className="text-2xl font-bold text-navy-700">{stats.averageIQ}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Briefs Visible</p>
          <p className="text-2xl font-bold text-navy-700">{stats.briefsVisible}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Top Weak Topic</p>
          <p className="text-sm font-semibold text-navy-600">{stats.topWeakTopic ?? "balanced coverage"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Flags / Brief</p>
          <p className="text-2xl font-bold text-navy-700">{stats.flagsPerBrief}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="search" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Search
        </label>
        <input
          id="search"
          type="search"
          placeholder="Advisor name or topic"
          value={filters.searchTerm}
          onChange={handleSearch}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
            <span>Compliance IQ Range</span>
            <span>{filters.complianceRange[0]}–{filters.complianceRange[1]}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={filters.complianceRange[0]}
              onChange={(event) => handleRangeChange(event, 0)}
              className="h-1 flex-1"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={filters.complianceRange[1]}
              onChange={(event) => handleRangeChange(event, 1)}
              className="h-1 flex-1"
            />
          </div>
        </div>

        <CheckboxList
          title="Office"
          items={OFFICES}
          selected={filters.offices}
          onToggle={(value) => toggleValue("offices", value)}
        />
        <CheckboxList
          title="Product"
          items={PRODUCTS}
          selected={filters.products}
          onToggle={(value) => toggleValue("products", value)}
        />
        <CheckboxList
          title="Client Risk"
          items={RISK_BANDS}
          selected={filters.risks}
          onToggle={(value) => toggleValue("risks", value)}
        />
        <CheckboxList
          title="Advisor Tenure"
          items={ADVISOR_TENURE}
          selected={filters.tenure}
          onToggle={(value) => toggleValue("tenure", value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-navy-400"
        >
          Clear filters
        </button>
        {filteredBriefs.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
            <p>No briefs match the current filters.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 text-sm font-semibold text-navy-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
