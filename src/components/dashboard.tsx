"use client";

import { useCallback, useMemo } from "react";
import { RefreshCw, Building2, LayoutGrid, TrendingUp, Wallet } from "lucide-react";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import type { Project, UnitWithProject } from "@/lib/types";

interface DashboardData {
  projects: Project[];
  units: UnitWithProject[];
}

// The 3 main project groups and which project IDs belong to each
const MAIN_GROUPS: { label: string; match: (name: string) => boolean }[] = [
  { label: "Verdana", match: (n) => /verdana/i.test(n) },
  { label: "Reportage Hills", match: (n) => /reportage\s*hills/i.test(n) },
  { label: "Taormina", match: (n) => /taormina/i.test(n) },
];

function formatPrice(value: number): string {
  if (value >= 1_000_000_000) return `AED ${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
}

function formatPriceShort(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
}

interface GroupStats {
  label: string;
  unitCount: number;
  minPrice: number;
  totalValue: number;
}

export default function Dashboard() {
  const fetcher = useCallback(async (): Promise<DashboardData> => {
    const projectsRes = await supabase.from("projects").select("*").order("name");
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

  const { data, isLoading, isRevalidating } = useCachedData<DashboardData>({
    cacheKey: "dashboard",
    fetcher,
  });

  const availableUnits = useMemo(
    () => (data?.units ?? []).filter((u) => u.status === "Available"),
    [data]
  );

  const avgPrice = useMemo(() => {
    if (availableUnits.length === 0) return 0;
    const total = availableUnits.reduce((sum, u) => sum + u.price_aed, 0);
    return total / availableUnits.length;
  }, [availableUnits]);

  const portfolioValue = useMemo(
    () => availableUnits.reduce((sum, u) => sum + u.price_aed, 0),
    [availableUnits]
  );

  // Group units into the 3 main project groups
  const groupStats = useMemo((): GroupStats[] => {
    const groups: GroupStats[] = MAIN_GROUPS.map((g) => ({
      label: g.label,
      unitCount: 0,
      minPrice: Infinity,
      totalValue: 0,
    }));

    for (const u of availableUnits) {
      const projectName = u.projects?.name ?? "";
      const idx = MAIN_GROUPS.findIndex((g) => g.match(projectName));
      if (idx === -1) continue;
      groups[idx].unitCount++;
      groups[idx].minPrice = Math.min(groups[idx].minPrice, u.price_aed);
      groups[idx].totalValue += u.price_aed;
    }

    // Fix Infinity for groups with no units
    for (const g of groups) {
      if (g.minPrice === Infinity) g.minPrice = 0;
    }

    return groups;
  }, [availableUnits]);

  const maxUnits = useMemo(
    () => Math.max(...groupStats.map((g) => g.unitCount), 1),
    [groupStats]
  );

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Dashboard</h2>
        {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Available Units</span>
          </div>
          <p className="text-2xl font-bold">{availableUnits.length.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            across {MAIN_GROUPS.length} active projects
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid size={14} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Active Projects</span>
          </div>
          <p className="text-2xl font-bold">{MAIN_GROUPS.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {MAIN_GROUPS.map((g) => g.label).join(" \u00b7 ")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Avg. Unit Price</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(avgPrice)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">average list price</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(portfolioValue)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">total listed inventory</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Inventory by Project */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold">Inventory by project</h3>
            <span className="text-[11px] text-gray-400">Available units &middot; {today}</span>
          </div>

          <div className="space-y-4">
            {groupStats.map((gs) => (
              <div key={gs.label}>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-xs font-semibold">{gs.label}</span>
                  <span className="text-[11px] text-gray-400">
                    {gs.unitCount} unit{gs.unitCount !== 1 ? "s" : ""} &middot; from {formatPriceShort(gs.minPrice)}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                    style={{ width: `${(gs.unitCount / maxUnits) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Project Quick Cards */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-gray-100">
            {groupStats.map((gs) => (
              <div
                key={gs.label}
                className="border border-gray-200 rounded-lg px-3 py-2.5 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs font-semibold">{gs.label}</p>
                <p className="text-[11px] text-gray-400">from {formatPriceShort(gs.minPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Offers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Recent offers</h3>
            <span className="text-[11px] text-primary font-medium cursor-pointer hover:underline">
              View all
            </span>
          </div>

          <div className="space-y-1">
            {availableUnits.length > 0 ? (
              availableUnits.slice(0, 4).map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{unit.unit_number}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {unit.projects?.name} &middot; {new Date(unit.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold">{formatPriceShort(unit.price_aed)}</p>
                    <p className="text-[10px] text-primary">Listed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No offers yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 h-[100px] bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-gray-100 rounded-xl h-[320px]" />
        <div className="bg-gray-100 rounded-xl h-[320px]" />
      </div>
    </div>
  );
}
