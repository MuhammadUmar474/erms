"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UnitWithProject } from "@/lib/types";
import type { Filters } from "./inventory-filters";

type SortKey = "unit_number" | "price_aed" | "total_area" | "bedrooms";
type SortDir = "asc" | "desc";

interface InventoryTableProps {
  units: UnitWithProject[];
  filters: Filters;
  onSelectUnit: (unit: UnitWithProject) => void;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatPrice(n: number): string {
  return `AED ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function statusColor(status: string) {
  switch (status) {
    case "Available":
      return "default" as const;
    case "Reserved":
      return "secondary" as const;
    case "Sold":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

export default function InventoryTable({
  units,
  filters,
  onSelectUnit,
}: InventoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("unit_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (filters.project !== "all" && u.project_id !== filters.project)
        return false;
      if (filters.category !== "all" && u.category !== filters.category)
        return false;
      if (filters.bedrooms !== "all" && u.bedrooms !== filters.bedrooms)
        return false;
      if (filters.view !== "all" && !u.view?.toLowerCase().includes(filters.view.toLowerCase()))
        return false;
      if (
        filters.search &&
        !u.unit_number.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [units, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "unit_number":
          cmp = a.unit_number.localeCompare(b.unit_number);
          break;
        case "price_aed":
          cmp = a.price_aed - b.price_aed;
          break;
        case "total_area":
          cmp = a.total_area - b.total_area;
          break;
        case "bedrooms":
          cmp = a.bedrooms.localeCompare(b.bedrooms);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Showing {sorted.length} of {units.length} units
      </p>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("unit_number")}
              >
                Unit #{sortIndicator("unit_number")}
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("bedrooms")}
              >
                Bedrooms{sortIndicator("bedrooms")}
              </TableHead>
              <TableHead>View</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("total_area")}
              >
                Total Area{sortIndicator("total_area")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("price_aed")}
              >
                Price{sortIndicator("price_aed")}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No units found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((unit) => (
                <TableRow
                  key={unit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectUnit(unit)}
                >
                  <TableCell className="font-medium">{unit.unit_number}</TableCell>
                  <TableCell>{unit.projects?.name ?? unit.project_id}</TableCell>
                  <TableCell>{unit.category}</TableCell>
                  <TableCell>{unit.bedrooms}</TableCell>
                  <TableCell>{unit.view ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(unit.total_area)} sqft
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(unit.price_aed)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(unit.status)}>{unit.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
