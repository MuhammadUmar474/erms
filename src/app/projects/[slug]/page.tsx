"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import ProjectCard from "@/components/project-card";
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
    description: string;
    heroImage: string;
    galleryImages: string[];
  }
> = {
  verdana: {
    label: "Verdana",
    match: (n) => /verdana/i.test(n),
    location: "Dubai Investment Park",
    description: "Mediterranean-inspired apartments & townhouses",
    heroImage: "/verdana_property.png",
    galleryImages: [
      "/verdana_property.png",
      "/verdana_property.png",
      "/verdana_property.png",
      "/verdana_property.png",
    ],
  },
  "reportage-hills": {
    label: "Reportage Hills",
    match: (n) => /reportage\s*hills/i.test(n),
    location: "Dubailand",
    description: "Premium townhouses & villas",
    heroImage: "/r_hills_properties.png",
    galleryImages: [
      "/r_hills_properties.png",
      "/r_hills_properties.png",
      "/r_hills_properties.png",
      "/r_hills_properties.png",
    ],
  },
  taormina: {
    label: "Taormina Village",
    match: (n) => /taormina/i.test(n),
    location: "Dubailand",
    description: "Mediterranean-inspired apartments & townhouses",
    heroImage: "/taormina_properties.png",
    galleryImages: [
      "/taormina_properties.png",
      "/taormina_properties.png",
      "/taormina_properties.png",
      "/taormina_properties.png",
    ],
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

function bedroomBreakdown(units: UnitWithProject[]): string {
  const counts: Record<string, number> = {};
  for (const u of units) {
    counts[u.bedrooms] = (counts[u.bedrooms] || 0) + 1;
  }
  const order = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
  return order
    .filter((b) => counts[b])
    .map((b) => `${b} \u00b7 ${counts[b]}`)
    .join(" | ");
}

interface CategoryData {
  category: string;
  units: UnitWithProject[];
  unitCount: number;
  bedroomRange: string;
  bedroomBreakdown: string;
  minPrice: number;
  image: string;
  location: string;
  description: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const group = PROJECT_GROUPS[slug];

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

  const allProjectUnits = useMemo(() => {
    if (!allUnits || !group) return [];
    return allUnits.filter((u) => group.match(u.projects?.name ?? ""));
  }, [allUnits, group]);

  const availableUnits = useMemo(
    () => allProjectUnits.filter((u) => u.status === "Available"),
    [allProjectUnits]
  );

  const availableCount = availableUnits.length;

  const bedRange = useMemo(() => {
    const beds = [...new Set(availableUnits.map((u) => u.bedrooms))];
    return bedroomRange(beds);
  }, [availableUnits]);

  const minPrice = useMemo(
    () => (availableUnits.length > 0 ? Math.min(...availableUnits.map((u) => u.price_aed)) : 0),
    [availableUnits]
  );

  // Group available units by category
  const categoryData = useMemo((): CategoryData[] => {
    const catMap = new Map<string, UnitWithProject[]>();
    for (const u of availableUnits) {
      const existing = catMap.get(u.category) || [];
      existing.push(u);
      catMap.set(u.category, existing);
    }

    const CATEGORY_DESCRIPTIONS: Record<string, string> = {
      Apartments: "STUDIO TO 3-BEDROOM RESIDENCES WITH COMMUNITY & POOL VIEWS",
      Townhouses: "SPACIOUS 3 & 4-BEDROOM HOMES WITH PRIVATE GARDENS & PLOTS",
    };

    return [...catMap.entries()].map(([cat, units]) => {
      const beds = [...new Set(units.map((u) => u.bedrooms))];
      return {
        category: cat,
        units,
        unitCount: units.length,
        bedroomRange: bedroomRange(beds),
        bedroomBreakdown: bedroomBreakdown(units),
        minPrice: Math.min(...units.map((u) => u.price_aed)),
        image: group?.heroImage ?? "",
        location: `${group?.location ?? ""} - Dubai`,
        description:
          CATEGORY_DESCRIPTIONS[cat] ??
          `${cat.toUpperCase()} IN ${group?.label.toUpperCase() ?? ""}`,
      };
    });
  }, [availableUnits, group]);

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
            <span className="font-semibold">{group.label}</span>
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
            <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 bg-black text-white hover:bg-black/80">
              <Plus size={14} />
              Add Unit
            </Button>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="bg-gray-100 rounded-xl h-[280px]" />
              <div className="bg-gray-100 rounded-xl h-[80px]" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-xl h-[420px]" />
                <div className="bg-gray-100 rounded-xl h-[420px]" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Gallery */}
              <div className="grid grid-cols-3 gap-3 h-[280px]">
                {/* Hero image */}
                <div className="col-span-2 relative rounded-xl overflow-hidden bg-gray-200">
                  <Image
                    src={group.heroImage}
                    alt={group.label}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Thumbnails 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                  {group.galleryImages.map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden bg-gray-200">
                      <Image src={img} alt={`${group.label} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Info Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{group.label}</h2>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {group.location} &middot; {group.description}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xl font-bold">{availableCount}</p>
                      <p className="text-[11px] text-gray-400">Units Available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{bedRange}</p>
                      <p className="text-[11px] text-gray-400">Bedrooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{formatPrice(minPrice)}</p>
                      <p className="text-[11px] text-gray-400">From</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.map((cat) => (
                  <ProjectCard
                    key={cat.category}
                    href={`/projects/${slug}/${cat.category.toLowerCase()}`}
                    image={cat.image}
                    typeBadge={cat.category}
                    unitCount={cat.unitCount}
                    title={group.label}
                    location={cat.location}
                    description={cat.description}
                    bedroomRange={cat.bedroomRange}
                    fromPrice={formatPrice(cat.minPrice)}
                    buttonLabel={`View ${cat.category} Units`}
                  />
                ))}
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
