"use client";

import { useState } from "react";
import InventoryFilters, { type Filters } from "./inventory-filters";
import InventoryTable from "./inventory-table";
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
    <div className="space-y-6">
      <InventoryFilters
        projects={projects}
        filters={filters}
        onFilterChange={setFilters}
      />
      <InventoryTable
        units={units}
        filters={filters}
        onSelectUnit={setSelectedUnit}
      />
      <UnitDetailModal
        unit={selectedUnit}
        open={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
}
