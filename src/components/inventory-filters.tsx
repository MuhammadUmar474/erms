"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

export interface Filters {
  project: string;
  category: string;
  bedrooms: string;
  view: string;
  search: string;
}

interface InventoryFiltersProps {
  projects: Project[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const BEDROOM_OPTIONS = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
const VIEW_OPTIONS = [
  "Pool",
  "Street",
  "Community",
  "Community Landscape",
  "Landscape",
  "Garden",
  "Park",
  "Retail & Mosque",
];

export default function InventoryFilters({
  projects,
  filters,
  onFilterChange,
}: InventoryFiltersProps) {
  const update = (key: keyof Filters, value: string | null) => {
    onFilterChange({ ...filters, [key]: value ?? "" });
  };

  const clearAll = () => {
    onFilterChange({
      project: "all",
      category: "all",
      bedrooms: "all",
      view: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.project !== "all" ||
    filters.category !== "all" ||
    filters.bedrooms !== "all" ||
    filters.view !== "all" ||
    filters.search !== "";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[160px]">
        <Select value={filters.project} onValueChange={(v) => update("project", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={filters.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Townhouse">Townhouse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select value={filters.bedrooms} onValueChange={(v) => update("bedrooms", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bedrooms</SelectItem>
            {BEDROOM_OPTIONS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={filters.view} onValueChange={(v) => update("view", v)}>
          <SelectTrigger>
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Views</SelectItem>
            {VIEW_OPTIONS.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <Input
          placeholder="Search unit number..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
