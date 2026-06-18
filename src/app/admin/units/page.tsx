"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin-layout";
import AdminUnitForm from "@/components/admin-unit-form";
import { useCachedData } from "@/hooks/use-cached-data";
import { Search, RefreshCw } from "lucide-react";
import type { Project, Unit, UnitWithProject } from "@/lib/types";
import {
  getProjects,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../actions";

async function fetchAdminData() {
  const [projects, units] = await Promise.all([getProjects(), getUnits()]);
  return { projects: projects as Project[], units: units as UnitWithProject[] };
}

export default function AdminUnitsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const { data, isLoading, isRevalidating, refresh } = useCachedData({
    cacheKey: "admin_data",
    fetcher: fetchAdminData,
  });

  const projects = data?.projects ?? [];
  const units = data?.units ?? [];

  const filteredUnits = search.trim()
    ? units.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.unit_number.toLowerCase().includes(q) ||
          (u.projects?.name ?? "").toLowerCase().includes(q) ||
          u.category.toLowerCase().includes(q) ||
          u.bedrooms.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q)
        );
      })
    : units;

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / rowsPerPage));
  const paginatedUnits = filteredUnits.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUnitSubmit = async (data: Record<string, unknown>) => {
    if (editingUnit) {
      await updateUnit(editingUnit.id, data);
    } else {
      await createUnit(data as Parameters<typeof createUnit>[0]);
    }
    refresh();
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    await deleteUnit(id);
    refresh();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateUnit(id, { status });
    refresh();
  };

  return (
    <AdminLayout title="Manage Units">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">
            Units ({filteredUnits.length}{search.trim() ? `/${units.length}` : ""})
          </h2>
          {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => {
            setEditingUnit(null);
            setUnitFormOpen(true);
          }}
        >
          + Add Unit
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search units by number, project, type, bedrooms..."
          className="h-8 text-xs pl-8 bg-white border-gray-200"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-xs text-gray-400">
          Loading units...
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-black text-primary">
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">UNIT #</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">PROJECT</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">TYPE</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">BEDROOMS</th>
                  <th className="px-3 py-2.5 text-right font-semibold tracking-wider">PRICE (AED)</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">STATUS</th>
                  <th className="px-3 py-2.5 text-right font-semibold tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUnits.map((unit, idx) => (
                  <tr key={unit.id} className={idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-3 py-2 font-medium">{unit.unit_number}</td>
                    <td className="px-3 py-2">{unit.projects?.name ?? unit.project_id}</td>
                    <td className="px-3 py-2">{unit.category}</td>
                    <td className="px-3 py-2">{unit.bedrooms}</td>
                    <td className="px-3 py-2 text-right">{unit.price_aed.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <select
                        value={unit.status}
                        onChange={(e) => handleStatusChange(unit.id, e.target.value)}
                        className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button
                          className="px-2 py-1 rounded text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setEditingUnit(unit);
                            setUnitFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleDeleteUnit(unit.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedUnits.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      {search.trim() ? "No units match your search." : "No units yet. Add your first unit."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredUnits.length > rowsPerPage && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[10px] text-gray-400">
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredUnits.length)} of {filteredUnits.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-[10px] text-gray-300 px-0.5">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-6 h-6 rounded text-[10px] font-medium ${p === page ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AdminUnitForm
        open={unitFormOpen}
        onClose={() => {
          setUnitFormOpen(false);
          setEditingUnit(null);
        }}
        onSubmit={handleUnitSubmit}
        projects={projects}
        unit={editingUnit}
      />
    </AdminLayout>
  );
}
