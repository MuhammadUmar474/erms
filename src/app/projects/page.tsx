"use client";

import { useCallback, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import ProjectCard from "@/components/project-card";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    location: "DIP, Dubai",
    description: "MEDITERRANEAN-INSPIRED APARTMENTS & TOWNHOUSES",
    image: "/verdana_property.png",
  },
  {
    slug: "reportage-hills",
    label: "Reportage Hills",
    match: (n: string) => /reportage\s*hills/i.test(n),
    location: "Dubailand",
    description: "PREMIUM TOWNHOUSES & VILLAS",
    image: "/r_hills_properties.png",
  },
  {
    slug: "taormina",
    label: "Taormina Village",
    match: (n: string) => /taormina/i.test(n),
    location: "Dubailand, UAE",
    description: "MEDITERRANEAN-INSPIRED APARTMENTS & TOWNHOUSES",
    image: "/taormina_properties.png",
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

function typeLabel(categories: string[]): string {
  const unique = [...new Set(categories)];
  if (unique.length === 0) return "";
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
        typeLabel: typeLabel(categories),
        minPrice,
      };
    });
  }, [data]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">Projects</h1>
            {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search Projects..."
                className="h-9 w-52 text-xs pl-9 bg-gray-50 border-gray-200"
              />
            </div>
            <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 bg-primary text-black hover:bg-primary/90">
              <Plus size={14} />
              Add Project
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4">

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-[420px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {groupData.map((group) => (
                <ProjectCard
                  key={group.label}
                  href={`/projects/${group.slug}`}
                  image={group.image}
                  typeBadge={group.typeLabel}
                  unitCount={group.unitCount}
                  title={group.label}
                  location={group.location}
                  description={group.description}
                  bedroomRange={group.bedroomRange}
                  fromPrice={formatPrice(group.minPrice)}
                  buttonLabel="View Units"
                />
              ))}

              {/* Add New Project Card */}
              <div
                className="rounded-[10px] overflow-hidden flex flex-col items-center justify-center max-w-[354px] h-[416px] hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='white' rx='10' ry='10' stroke='%23d1d5db' stroke-width='1' stroke-dasharray='13%2c 13' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus size={24} className="text-primary" />
                </div>
                <p className="text-lg font-semibold text-black">Add a new project</p>
              </div>
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
