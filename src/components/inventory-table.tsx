"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UnitWithProject } from "@/lib/types";
import type { Filters } from "./inventory-filters";

type SortKey = "unit_number" | "price_aed" | "total_area" | "bedrooms";
type SortDir = "asc" | "desc";

interface InventoryTableProps {
  units: UnitWithProject[];
  filters: Filters;
  onSelectUnit: (unit: UnitWithProject) => void;
  getUnitHref?: (unit: UnitWithProject) => string;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function InventoryTable({
  units,
  filters,
  onSelectUnit,
  getUnitHref,
}: InventoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("unit_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (filters.project !== "all" && u.project_id !== filters.project) return false;
      if (filters.category !== "all" && u.category !== filters.category) return false;
      if (filters.bedrooms !== "all" && u.bedrooms !== filters.bedrooms) return false;
      if (filters.view !== "all" && !u.view?.toLowerCase().includes(filters.view.toLowerCase())) return false;
      if (filters.search && !u.unit_number.toLowerCase().includes(filters.search.toLowerCase())) return false;
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paginatedRows = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const startRow = sorted.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endRow = Math.min(page * rowsPerPage, sorted.length);

  const statusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "text-primary";
      case "Reserved":
        return "text-orange-500";
      case "Sold":
        return "text-red-500";
      default:
        return "";
    }
  };

  const columns: { key: SortKey | null; label: string; sortable?: boolean; align?: string }[] = [
    { key: "unit_number", label: "UNIT NO.", sortable: true },
    { key: null, label: "PROJECT" },
    { key: null, label: "TYPE" },
    { key: "bedrooms", label: "BEDROOMS", sortable: true },
    { key: null, label: "VIEW" },
    { key: "total_area", label: "TOTAL AREA", sortable: true, align: "right" },
    { key: "price_aed", label: "PRICE (AED)", sortable: true, align: "right" },
    { key: null, label: "STATUS" },
    { key: null, label: "" },
  ];

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push("...");
      if (page > 3 && page < totalPages - 2) pages.push(page);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-primary font-bold">{sorted.length} Units Found</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Showing all available units</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs relative z-10">
          <span className="text-gray-500">Sort by:</span>
          <Select
            value={sortKey}
            onValueChange={(v) => {
              setSortKey(v as SortKey);
              setSortDir("asc");
            }}
          >
            <SelectTrigger className="w-[160px] h-7 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="unit_number">Unit No. (A - Z)</SelectItem>
              <SelectItem value="price_aed">Price (Low - High)</SelectItem>
              <SelectItem value="total_area">Area (Small - Large)</SelectItem>
              <SelectItem value="bedrooms">Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-black text-primary">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-3 py-2.5 font-semibold tracking-wider whitespace-nowrap ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${col.sortable ? "cursor-pointer select-none hover:text-white" : ""}`}
                    onClick={() => col.sortable && col.key && toggleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable && col.key && sortIndicator(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 text-xs">
                    No units found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((unit, idx) => (
                  <tr
                    key={unit.id}
                    className={`hover:bg-primary/5 transition-colors ${
                      idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{unit.unit_number}</td>
                    <td className="px-3 py-2">{unit.projects?.name ?? unit.project_id}</td>
                    <td className="px-3 py-2">{unit.category}</td>
                    <td className="px-3 py-2">{unit.bedrooms}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{unit.view ?? "\u2014"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(unit.total_area)}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatNumber(unit.price_aed)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] uppercase font-semibold ${statusClass(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {getUnitHref ? (
                        <Link
                          href={getUnitHref(unit)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-black transition-colors inline-flex"
                        >
                          <Eye size={14} />
                        </Link>
                      ) : (
                        <button
                          onClick={() => onSelectUnit(unit)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <p className="text-gray-500">
            Showing {startRow} to {endRow} of {sorted.length} results
          </p>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {getPageNumbers().map((p, idx) =>
              typeof p === "string" ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400">
                  {p}
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[26px] h-6 rounded text-xs font-medium transition-colors ${
                    page === p
                      ? "bg-primary text-black"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                setRowsPerPage(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[56px] h-6 text-xs bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
