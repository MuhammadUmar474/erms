"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
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
    filters.view !== "all";

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
      <div className="grid grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Project</label>
          <Select value={filters.project} onValueChange={(v) => update("project", v)}>
            <SelectTrigger className="w-full h-9 text-xs bg-gray-50/80 border-gray-200">
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

        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Property Type</label>
          <Select value={filters.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger className="w-full h-9 text-xs bg-gray-50/80 border-gray-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Bedrooms</label>
          <Select value={filters.bedrooms} onValueChange={(v) => update("bedrooms", v)}>
            <SelectTrigger className="w-full h-9 text-xs bg-gray-50/80 border-gray-200">
              <SelectValue placeholder="All Bedrooms" />
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

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-medium text-gray-500 mb-1 block">View</label>
            <Select value={filters.view} onValueChange={(v) => update("view", v)}>
              <SelectTrigger className="w-full h-9 text-xs bg-gray-50/80 border-gray-200">
                <SelectValue placeholder="All Views" />
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
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-9 px-2.5 gap-1.5 text-xs text-gray-500 hover:text-black shrink-0"
            >
              <RotateCcw size={12} />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
