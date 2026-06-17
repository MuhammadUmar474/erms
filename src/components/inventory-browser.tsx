"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import InventoryFilters, { type Filters } from "./inventory-filters";
import InventoryTable from "./inventory-table";
import StatsCards from "./stats-cards";
import UnitDetailModal from "./unit-detail-modal";
import type { Project, UnitWithProject } from "@/lib/types";

interface InventoryBrowserProps {
  projects: Project[];
  units: UnitWithProject[];
}

const defaultFilters: Filters = {
  project: "all",
  category: "all",
  bedrooms: "all",
  view: "all",
  search: "",
};

export default function InventoryBrowser({
  projects,
  units,
}: InventoryBrowserProps) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithProject | null>(null);

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Available Units</h2>
          <p className="text-xs text-gray-500">
            Browse and filter available units across all Reportage projects.
          </p>
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
