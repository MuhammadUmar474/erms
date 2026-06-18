"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import InventoryTable from "@/components/inventory-table";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { UnitWithProject } from "@/lib/types";
import type { Filters } from "@/components/inventory-filters";

const PROJECT_GROUPS: Record<string, {
  label: string;
  match: (n: string) => boolean;
  location: string;
  description: string;
}> = {
  verdana: {
    label: "Verdana",
    match: (n) => /verdana/i.test(n),
    location: "Dubai Investment Park",
    description: "Mediterranean-inspired apartments & townhouses",
  },
  "reportage-hills": {
    label: "Reportage Hills",
    match: (n) => /reportage\s*hills/i.test(n),
    location: "Dubailand",
    description: "Premium townhouses & villas",
  },
  taormina: {
    label: "Taormina Village",
    match: (n) => /taormina/i.test(n),
    location: "Dubailand",
    description: "Italian-inspired townhouse village",
  },
};

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
}

function bedroomRange(bedrooms: string[]): string {
  const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
  const sorted = bedrooms
    .filter((b) => order.includes(b))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (sorted.length === 0) return "—";
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const group = PROJECT_GROUPS[slug];

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState("all");
  const [viewFilter, setViewFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Available");
  const [priceFilter, setPriceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const getUnitHref = useCallback(
    (unit: UnitWithProject) => `/projects/${slug}/${encodeURIComponent(unit.unit_number)}`,
    [slug]
  );

  const fetcher = useCallback(async () => {
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
    return allUnits;
  }, []);

  const { data: allUnits, isLoading, isRevalidating } = useCachedData({
    cacheKey: `project_${slug}`,
    fetcher,
  });

  // All units in this project group
  const allProjectUnits = useMemo(() => {
    if (!allUnits || !group) return [];
    return allUnits.filter((u) => group.match(u.projects?.name ?? ""));
  }, [allUnits, group]);

  // Units after status + price filter (before table handles category/bedrooms/search)
  const projectUnits = useMemo(() => {
    let filtered = allProjectUnits;
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((u) => u.price_aed >= min && (max ? u.price_aed <= max : true));
    }
    return filtered;
  }, [allProjectUnits, statusFilter, priceFilter]);

  // Derived stats (from all units in group, not filtered)
  const availableBedrooms = useMemo(() => {
    const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
    const set = new Set(allProjectUnits.map((u) => u.bedrooms));
    return order.filter((b) => set.has(b));
  }, [allProjectUnits]);

  const availableViews = useMemo(() => {
    const set = new Set(allProjectUnits.map((u) => u.view).filter(Boolean) as string[]);
    return [...set].sort();
  }, [allProjectUnits]);

  const categories = useMemo(
    () => [...new Set(allProjectUnits.map((u) => u.category))],
    [allProjectUnits]
  );

  const availableCount = useMemo(
    () => allProjectUnits.filter((u) => u.status === "Available").length,
    [allProjectUnits]
  );

  const minPrice = useMemo(
    () => (allProjectUnits.length > 0 ? Math.min(...allProjectUnits.map((u) => u.price_aed)) : 0),
    [allProjectUnits]
  );

  const bedRange = useMemo(() => bedroomRange(availableBedrooms), [availableBedrooms]);

  // Build filters object for InventoryTable
  const filters: Filters = useMemo(
    () => ({
      project: "all",
      category: categoryFilter,
      bedrooms: bedroomFilter,
      view: viewFilter,
      search,
    }),
    [categoryFilter, bedroomFilter, viewFilter, search]
  );

  const PRICE_RANGES = [
    { label: "All", value: "all" },
    { label: "Under 1M", value: "0-1000000" },
    { label: "1M – 2M", value: "1000000-2000000" },
    { label: "2M – 3M", value: "2000000-3000000" },
    { label: "3M – 5M", value: "3000000-5000000" },
    { label: "5M+", value: "5000000-0" },
  ];

  if (!group) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title="Project Not Found" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Project not found.</p>
              <Link href="/projects" className="text-xs text-primary font-medium hover:underline">
                Back to Projects
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={group.label} />
        <main className="flex-1 p-4">
          {/* Breadcrumb + Search */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                <Link href="/projects" className="text-primary hover:underline">
                  Projects
                </Link>
                <span>/</span>
                <span className="text-gray-600">{group.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{group.label}</h2>
                {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
              </div>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search unit no...."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-[200px] text-xs bg-white border-gray-200"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="bg-gray-100 rounded-xl h-[100px]" />
              <div className="bg-gray-100 rounded-xl h-[400px]" />
            </div>
          ) : (
            <>
              {/* Project Info Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* Cover placeholder */}
                  <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 shrink-0" />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">{group.label}</h3>
                    <p className="text-[11px] text-gray-400">
                      {group.location} &middot; {group.description}
                    </p>
                  </div>
                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <p className="text-sm font-bold">{bedRange}</p>
                      <p className="text-[10px] text-gray-400">Bedrooms</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <p className="text-sm font-bold">{formatPrice(minPrice)}</p>
                      <p className="text-[10px] text-gray-400">From</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Category pills */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      categoryFilter === "all"
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        categoryFilter === cat
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div className="h-5 w-px bg-gray-200" />

                {/* Bedroom pills */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-400 mr-0.5">Beds</span>
                  {availableBedrooms.map((bed) => (
                    <button
                      key={bed}
                      onClick={() => setBedroomFilter(bedroomFilter === bed ? "all" : bed)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        bedroomFilter === bed
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div className="h-5 w-px bg-gray-200" />

                {/* Dropdown filters */}
                {/* View */}
                <select
                  value={viewFilter}
                  onChange={(e) => setViewFilter(e.target.value)}
                  className={`h-8 px-3 pr-7 rounded-full text-xs font-medium border appearance-none bg-no-repeat bg-[length:12px] bg-[right_8px_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] transition-colors ${
                    viewFilter !== "all"
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value="all">View: All</option>
                  {availableViews.map((v) => (
                    <option key={v} value={v}>{`View: ${v}`}</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`h-8 px-3 pr-7 rounded-full text-xs font-medium border appearance-none bg-no-repeat bg-[length:12px] bg-[right_8px_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] transition-colors ${
                    statusFilter !== "all"
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value="all">Status: All</option>
                  <option value="Available">Status: Available</option>
                  <option value="Reserved">Status: Reserved</option>
                  <option value="Sold">Status: Sold</option>
                </select>

                {/* Price */}
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className={`h-8 px-3 pr-7 rounded-full text-xs font-medium border appearance-none bg-no-repeat bg-[length:12px] bg-[right_8px_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] transition-colors ${
                    priceFilter !== "all"
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.value === "all" ? "Price" : r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inventory Table */}
              <InventoryTable
                units={projectUnits}
                filters={filters}
                onSelectUnit={() => {}}
                getUnitHref={getUnitHref}
              />
            </>
          )}
        </main>
        <footer className="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>&copy; 2026 Reportage Properties. All rights reserved.</span>
          <span>All information is subject to change without notice.</span>
        </footer>
      </div>
    </div>
  );
}
