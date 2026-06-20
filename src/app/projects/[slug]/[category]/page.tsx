"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Plus, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UnitWithProject } from "@/lib/types";

const PROJECT_GROUPS: Record<
  string,
  {
    label: string;
    match: (n: string) => boolean;
    location: string;
    image: string;
  }
> = {
  verdana: {
    label: "Verdana",
    match: (n) => /verdana/i.test(n),
    location: "Dubai Investment Park",
    image: "/verdana_property.png",
  },
  "reportage-hills": {
    label: "Reportage Hills",
    match: (n) => /reportage\s*hills/i.test(n),
    location: "Dubailand",
    image: "/r_hills_properties.png",
  },
  taormina: {
    label: "Taormina Village",
    match: (n) => /taormina/i.test(n),
    location: "Dubailand",
    image: "/taormina_properties.png",
  },
};

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
}

function formatArea(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Group units by bedroom + sub_type to create listing cards
interface UnitGroup {
  key: string;
  label: string;
  units: UnitWithProject[];
  totalArea: number;
  minPrice: number;
  status: string;
}

export default function CategoryListingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryParam = decodeURIComponent(params.category as string);
  const group = PROJECT_GROUPS[slug];

  // Capitalize category for display
  const categoryLabel = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  const [bedsFilter, setBedsFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [viewFilter, setViewFilter] = useState("all");

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
    cacheKey: `project_${slug}_${categoryParam}`,
    fetcher,
  });

  // Filter to this project group + category
  const categoryUnits = useMemo(() => {
    if (!allUnits || !group) return [];
    return allUnits.filter((u) => {
      const matchesProject = group.match(u.projects?.name ?? "");
      const matchesCategory = u.category.toLowerCase() === categoryParam.toLowerCase();
      return matchesProject && matchesCategory;
    });
  }, [allUnits, group, categoryParam]);

  // Available views for filter
  const availableViews = useMemo(() => {
    const set = new Set(categoryUnits.map((u) => u.view).filter(Boolean) as string[]);
    return [...set].sort();
  }, [categoryUnits]);

  // Available bedrooms for filter
  const availableBeds = useMemo(() => {
    const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
    const set = new Set(categoryUnits.map((u) => u.bedrooms));
    return order.filter((b) => set.has(b));
  }, [categoryUnits]);

  // Apply filters
  const filteredUnits = useMemo(() => {
    let units = categoryUnits.filter((u) => u.status === "Available");
    if (bedsFilter !== "all") {
      units = units.filter((u) => u.bedrooms === bedsFilter);
    }
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      units = units.filter((u) => u.price_aed >= min && (max ? u.price_aed <= max : true));
    }
    if (viewFilter !== "all") {
      units = units.filter((u) => u.view === viewFilter);
    }
    return units;
  }, [categoryUnits, bedsFilter, priceFilter, viewFilter]);

  // Group by bedrooms + sub_type for card display
  const unitGroups = useMemo((): UnitGroup[] => {
    const map = new Map<string, UnitWithProject[]>();
    for (const u of filteredUnits) {
      const key = `${u.bedrooms}|${u.sub_type || ""}`;
      const existing = map.get(key) || [];
      existing.push(u);
      map.set(key, existing);
    }

    const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];

    return [...map.entries()]
      .map(([key, units]) => {
        const [bed, subType] = key.split("|");
        const label = subType
          ? `${bed === "Studio" ? "ST" : bed.replace("BR", " BEDROOM")} | ${subType.toUpperCase()}`
          : `${bed === "Studio" ? "ST" : bed.replace("BR", " BEDROOM")}`;
        return {
          key,
          label,
          units,
          totalArea: units[0]?.total_area ?? 0,
          minPrice: Math.min(...units.map((u) => u.price_aed)),
          status: "Available",
        };
      })
      .sort((a, b) => {
        const aIdx = order.indexOf(a.key.split("|")[0]);
        const bIdx = order.indexOf(b.key.split("|")[0]);
        return aIdx - bIdx;
      });
  }, [filteredUnits]);

  const PRICE_RANGES = [
    { label: "All Prices", value: "all" },
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
          <header className="h-14 border-b border-gray-200 bg-white flex items-center px-5">
            <h1 className="text-sm font-semibold">Project Not Found</h1>
          </header>
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
        {/* Header */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-5">
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/projects" className="text-gray-400 hover:text-black transition-colors">
              Projects
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/projects/${slug}`}
              className="text-gray-400 hover:text-black transition-colors"
            >
              {group.label}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold">{categoryLabel}</span>
            {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin ml-1" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search Projects..."
                className="h-9 w-52 text-xs pl-9 bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              size="sm"
              className="h-9 text-xs font-semibold gap-1.5 bg-black text-white hover:bg-black/80"
            >
              <Plus size={14} />
              Add Unit
            </Button>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="bg-gray-100 rounded-xl h-[60px]" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-[380px]" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Beds</label>
                    <select
                      value={bedsFilter}
                      onChange={(e) => setBedsFilter(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg text-xs border border-gray-200 bg-white"
                    >
                      <option value="all">Select</option>
                      {availableBeds.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Price</label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg text-xs border border-gray-200 bg-white"
                    >
                      {PRICE_RANGES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.value === "all" ? "Select" : r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">View</label>
                    <select
                      value={viewFilter}
                      onChange={(e) => setViewFilter(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg text-xs border border-gray-200 bg-white"
                    >
                      <option value="all">Select</option>
                      {availableViews.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Unit Cards Grid */}
              {unitGroups.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-400">
                  No units found matching your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitGroups.map((ug) => (
                    <div
                      key={ug.key}
                      className="bg-white rounded-[10px] border border-gray-200 overflow-hidden flex flex-col shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <Image
                          src={group.image}
                          alt={ug.label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Status badge - top left */}
                        <span className="absolute top-3 left-3 text-[10px] font-medium bg-green-100 text-green-700 px-[5px] py-[3px] rounded-2xl">
                          {ug.status}
                        </span>

                        {/* Unit count - top right */}
                        <span className="absolute top-3 right-3 text-[10px] font-semibold bg-[#FFBE00] text-black px-[5px] py-[3px] rounded-2xl">
                          {ug.units.length} units
                        </span>

                        {/* Location - bottom */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1">
                          <MapPin size={10} className="text-primary" />
                          <span className="text-[11px] text-white/80">
                            {group.location} - Dubai
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-sm font-bold text-gray-800 leading-snug">
                          {ug.label}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-2 mt-3">
                          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                              Total Area
                            </p>
                            <p className="text-sm font-bold">
                              {formatArea(ug.totalArea)} SQ.FT
                            </p>
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                              From
                            </p>
                            <p className="text-sm font-bold">{formatPrice(ug.minPrice)}</p>
                          </div>
                        </div>

                        {/* Button */}
                        <Link
                          href={`/projects/${slug}/${categoryParam}/${encodeURIComponent(ug.units[0].unit_number)}`}
                          className="mt-3 flex items-center justify-center gap-2.5 bg-primary text-black text-sm font-bold h-10 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          View Now &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
