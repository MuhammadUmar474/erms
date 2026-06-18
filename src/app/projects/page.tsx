"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";
import type { Project, UnitWithProject } from "@/lib/types";

interface ProjectsData {
  projects: Project[];
  units: UnitWithProject[];
}

const MAIN_GROUPS = [
  {
    slug: "verdana",
    label: "Verdana",
    match: (n: string) => /verdana/i.test(n),
    location: "Dubai Investment Park",
    description: "Mediterranean-inspired apartments & townhouses",
  },
  {
    slug: "reportage-hills",
    label: "Reportage Hills",
    match: (n: string) => /reportage\s*hills/i.test(n),
    location: "Dubailand",
    description: "Premium townhouses & villas",
  },
  {
    slug: "taormina",
    label: "Taormina Village",
    match: (n: string) => /taormina/i.test(n),
    location: "Dubailand",
    description: "Italian-inspired townhouse village",
  },
];

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
}

function bedroomRange(bedrooms: string[]): string {
  const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR", "RETAIL"];
  const sorted = bedrooms
    .filter((b) => order.includes(b))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (sorted.length === 0) return "—";
  if (sorted.length === 1) return sorted[0];
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

function homeTypes(categories: string[]): string {
  const unique = [...new Set(categories)];
  if (unique.length === 0) return "—";
  return unique.join(" · ");
}

export default function ProjectsPage() {
  const fetcher = useCallback(async (): Promise<ProjectsData> => {
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

  const { data, isLoading, isRevalidating } = useCachedData({
    cacheKey: "projects_page",
    fetcher,
  });

  const groupData = useMemo(() => {
    const units = (data?.units ?? []).filter((u) => u.status === "Available");
    return MAIN_GROUPS.map((group) => {
      const groupUnits = units.filter((u) => group.match(u.projects?.name ?? ""));
      const bedrooms = [...new Set(groupUnits.map((u) => u.bedrooms))];
      const categories = [...new Set(groupUnits.map((u) => u.category))];
      const minPrice = groupUnits.length > 0 ? Math.min(...groupUnits.map((u) => u.price_aed)) : 0;
      return {
        ...group,
        unitCount: groupUnits.length,
        bedroomRange: bedroomRange(bedrooms),
        homeTypes: homeTypes(categories),
        minPrice,
      };
    });
  }, [data]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Projects" />
        <main className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold">Projects</h2>
            {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-[420px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {groupData.map((group) => (
                <div
                  key={group.label}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* Cover image placeholder */}
                  <div className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="absolute top-3 left-3 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {group.label} &middot; cover
                    </span>
                    <span className="absolute top-3 right-3 text-[11px] font-semibold bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                      {group.unitCount} units
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold">{group.label}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{group.location}</p>
                    <p className="text-xs text-gray-500 mt-2">{group.description}</p>

                    {/* Stats pills */}
                    <div className="flex gap-2 mt-4">
                      <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold">{group.unitCount}</p>
                        <p className="text-[10px] text-gray-400">Available</p>
                      </div>
                      <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold">{group.bedroomRange}</p>
                        <p className="text-[10px] text-gray-400">Bedrooms</p>
                      </div>
                      <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold">{group.homeTypes}</p>
                        <p className="text-[10px] text-gray-400">Homes</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">From</p>
                        <p className="text-sm font-bold">{formatPrice(group.minPrice)}</p>
                      </div>
                      <Link
                        href={`/projects/${group.slug}`}
                        className="inline-flex items-center gap-1 bg-black text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
                      >
                        View units &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
