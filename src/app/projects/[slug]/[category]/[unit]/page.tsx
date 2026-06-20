"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnitWithProject } from "@/lib/types";

const PROJECT_LABELS: Record<string, string> = {
  verdana: "Verdana",
  "reportage-hills": "Reportage Hills",
  taormina: "Taormina Village",
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function UnitDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = decodeURIComponent(params.category as string);
  const unitNumber = decodeURIComponent(params.unit as string);
  const projectLabel = PROJECT_LABELS[slug] ?? slug;
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  const fetcher = useCallback(async () => {
    const { data, error } = await supabase
      .from("units")
      .select("*, projects(*)")
      .eq("unit_number", unitNumber)
      .limit(1)
      .single();
    if (error) throw error;
    return data as UnitWithProject;
  }, [unitNumber]);

  const { data: unit, isLoading, isRevalidating } = useCachedData({
    cacheKey: `unit_${slug}_${unitNumber}`,
    fetcher,
  });

  const statusColor = useMemo(() => {
    switch (unit?.status) {
      case "Available":
        return "text-green-600";
      case "Reserved":
        return "text-orange-600";
      case "Sold":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, [unit?.status]);

  const handleGenerateOffer = async () => {
    if (!unit) return;
    try {
      const res = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: unit.id }),
      });
      if (!res.ok) throw new Error("Failed to generate offer");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Offer_${unit.unit_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate offer PDF.");
    }
  };

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
              {projectLabel}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold">{categoryLabel}</span>
            {isRevalidating && (
              <RefreshCw size={14} className="text-gray-400 animate-spin ml-1" />
            )}
          </div>
          <Button
            onClick={handleGenerateOffer}
            size="sm"
            className="h-9 text-xs font-semibold gap-1.5 bg-black text-white hover:bg-black/80"
            disabled={!unit}
          >
            <Plus size={14} />
            Generate Offer
          </Button>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          {isLoading || !unit ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-gray-100 rounded-xl h-[350px]" />
                <div className="bg-gray-100 rounded-xl h-[350px]" />
              </div>
              <div className="bg-gray-100 rounded-xl h-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-xl h-[200px]" />
                <div className="bg-gray-100 rounded-xl h-[200px]" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Row: Floor Plan + Price/Glance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Floor Plan Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center min-h-[350px]">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-400 mb-2">
                      {unit.bedrooms === "Studio" ? "ST" : unit.bedrooms} | {unit.sub_type ?? "Type A"}
                    </div>
                    <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-xs text-gray-300">Floor Plan</span>
                    </div>
                    <div className="inline-block text-left text-[11px] space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Internal Area</span>
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-medium">
                          {formatNumber(unit.internal_area)} sq.ft
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Outdoor Area</span>
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-medium">
                          {formatNumber(unit.external_area)} sq.ft
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Total Area</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium">
                          {formatNumber(unit.total_area)} sq.ft
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Price + At a Glance */}
                <div className="space-y-4">
                  {/* Total Price Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total Price
                      </span>
                      <span className={`text-xs font-semibold ${statusColor}`}>
                        {unit.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold mb-4">
                      AED {formatNumber(unit.price_aed)}
                    </p>
                    <Button
                      onClick={handleGenerateOffer}
                      className="w-full h-10 text-sm font-semibold bg-primary text-black hover:bg-primary/90"
                    >
                      Generate Offer
                    </Button>
                  </div>

                  {/* At a Glance */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                      At a Glance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Unit No.</span>
                        <span className="text-xs font-semibold">{unit.unit_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total Area</span>
                        <span className="text-xs font-semibold">
                          {formatNumber(unit.total_area)} Sq.Ft
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Location</span>
                        <span className="text-xs font-semibold">
                          {unit.projects?.location ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Project</span>
                        <span className="text-xs font-semibold">
                          {unit.sub_type ?? unit.projects?.name ?? "—"}
                        </span>
                      </div>
                      {unit.floor && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Floor / Plot</span>
                          <span className="text-xs font-semibold">{unit.floor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Project</p>
                    <p className="text-xs font-semibold">{unit.projects?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Property Type</p>
                    <p className="text-xs font-semibold">{unit.category}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Bedrooms</p>
                    <p className="text-xs font-semibold">{unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Sub-Type</p>
                    <p className="text-xs font-semibold">{unit.sub_type ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">View</p>
                    <p className="text-xs font-semibold">{unit.view ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Area Breakdown + Payment Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Area Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                    Area Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Internal</span>
                      <span className="text-xs font-semibold">
                        {formatNumber(unit.internal_area)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">External Area</span>
                      <span className="text-xs font-semibold">
                        {formatNumber(unit.external_area)} Sq.Ft
                      </span>
                    </div>
                    {unit.plot_area != null && unit.plot_area > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Plot Area</span>
                        <span className="text-xs font-semibold">
                          {formatNumber(unit.plot_area)} Sq.Ft
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">External Area</span>
                      <span className="text-xs font-bold">
                        {formatNumber(unit.total_area)} Sq.Ft
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                    Payment Plan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Down Payment</p>
                        <p className="text-[10px] text-gray-400">On Booking</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">
                          AED {formatNumber(Math.round(unit.price_aed * 0.1))}
                        </p>
                        <p className="text-[10px] text-gray-400">10%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">During Construction</p>
                        <p className="text-[10px] text-gray-400">Installments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">
                          AED {formatNumber(Math.round(unit.price_aed * 0.6))}
                        </p>
                        <p className="text-[10px] text-gray-400">60%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">On Handover</p>
                        <p className="text-[10px] text-gray-400">Completion</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">
                          AED {formatNumber(Math.round(unit.price_aed * 0.3))}
                        </p>
                        <p className="text-[10px] text-gray-400">30%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold">Total</span>
                      <span className="text-xs font-bold">
                        AED {formatNumber(unit.price_aed)}
                      </span>
                    </div>
                  </div>
                </div>
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
