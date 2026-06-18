"use client";

import { useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import InventoryFilters, { type Filters } from "./inventory-filters";
import InventoryTable from "./inventory-table";
import StatsCards from "./stats-cards";
import UnitDetailModal from "./unit-detail-modal";
import InventorySkeleton from "./inventory-skeleton";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import type { Project, UnitWithProject } from "@/lib/types";

interface InventoryData {
  projects: Project[];
  units: UnitWithProject[];
}

const MAIN_PROJECT_MATCHERS = [
  (n: string) => /verdana/i.test(n),
  (n: string) => /reportage\s*hills/i.test(n),
  (n: string) => /taormina/i.test(n),
];

function isMainProject(name: string): boolean {
  return MAIN_PROJECT_MATCHERS.some((m) => m(name));
}

const defaultFilters: Filters = {
  project: "all",
  category: "all",
  bedrooms: "all",
  view: "all",
  search: "",
};

export default function InventoryBrowser() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithProject | null>(null);

  const fetcher = useCallback(async (): Promise<InventoryData> => {
    const projectsRes = await supabase.from("projects").select("*").order("name");
    // Fetch all units (Supabase defaults to 1000 row limit)
    const allUnits: UnitWithProject[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("units")
        .select("*, projects(*)")
        .order("unit_number")
        .range(from, from + pageSize - 1);
      if (error) break;
      if (!data || data.length === 0) break;
      allUnits.push(...(data as UnitWithProject[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return {
      projects: (projectsRes.data as Project[]) ?? [],
      units: allUnits,
    };
  }, []);

  const { data, isLoading, isRevalidating, error, refresh } = useCachedData<InventoryData>({
    cacheKey: "inventory",
    fetcher,
  });

  // No cache, still loading — show skeleton
  if (isLoading) {
    return <InventorySkeleton />;
  }

  // Error and no data at all
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-gray-500 mb-3">Failed to load inventory data.</p>
        <button
          onClick={refresh}
          className="text-xs text-primary font-medium hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const projects = data!.projects.filter((p) => isMainProject(p.name));
  const units = data!.units.filter((u) => isMainProject(u.projects?.name ?? ""));

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-lg font-bold">Available Units</h2>
            <p className="text-xs text-gray-500">
              Browse and filter available units across all Reportage projects.
            </p>
          </div>
          {isRevalidating && (
            <RefreshCw size={14} className="text-gray-400 animate-spin" />
          )}
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search unit number..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-8 h-8 w-[220px] text-xs bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Stats */}
      <StatsCards units={units} projects={projects} />

      {/* Filters */}
      <InventoryFilters
        projects={projects}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Table */}
      <InventoryTable
        units={units}
        filters={filters}
        onSelectUnit={setSelectedUnit}
      />

      {/* Detail Modal */}
      <UnitDetailModal
        unit={selectedUnit}
        open={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
}
