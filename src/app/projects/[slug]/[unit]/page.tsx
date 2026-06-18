"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw, FileText } from "lucide-react";
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
  const unitNumber = decodeURIComponent(params.unit as string);
  const projectLabel = PROJECT_LABELS[slug] ?? slug;

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
      case "Available": return "bg-green-50 text-green-700 border-green-200";
      case "Reserved": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Sold": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
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
        <TopBar title={`Unit ${unitNumber}`} />
        <main className="flex-1 p-4">
          {/* Breadcrumb + Action */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                <Link href="/projects" className="text-primary hover:underline">Projects</Link>
                <span>/</span>
                <Link href={`/projects/${slug}`} className="text-primary hover:underline">{projectLabel}</Link>
                <span>/</span>
                <span className="text-gray-600">{unitNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Unit {unitNumber}</h2>
                {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
              </div>
            </div>
            <Button
              onClick={handleGenerateOffer}
              className="h-9 text-xs font-semibold gap-1.5"
              disabled={!unit}
            >
              <FileText size={14} />
              Generate Offer &rarr;
            </Button>
          </div>

          {isLoading || !unit ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-gray-100 rounded-xl h-[250px]" />
                <div className="bg-gray-100 rounded-xl h-[250px]" />
              </div>
              <div className="bg-gray-100 rounded-xl h-[180px]" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Row: Images + Price Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Image Placeholders */}
                <div className="lg:col-span-2 grid grid-cols-3 gap-2">
                  {/* Hero image */}
                  <div className="col-span-2 row-span-3 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl relative min-h-[240px]">
                    <span className={`absolute top-3 left-3 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {unit.status}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      Exterior &middot; hero photo
                    </span>
                  </div>
                  {/* Side thumbnails */}
                  <div className="bg-gradient-to-br from-gray-200 to-gray-250 rounded-lg flex items-end p-2">
                    <span className="text-[9px] text-gray-400">Kitchen</span>
                  </div>
                  <div className="bg-gradient-to-br from-gray-200 to-gray-250 rounded-lg flex items-end p-2">
                    <span className="text-[9px] text-gray-400">Master bedroom</span>
                  </div>
                  <div className="bg-gradient-to-br from-gray-200 to-gray-250 rounded-lg flex items-end p-2">
                    <span className="text-[9px] text-gray-400">Floor plan</span>
                  </div>
                </div>

                {/* Price + Quick Info Card */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Total Price</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {unit.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold mb-1">AED {formatNumber(unit.price_aed)}</p>
                    {unit.payment_plan && (
                      <p className="text-xs text-gray-400">{unit.payment_plan}</p>
                    )}
                    <Button
                      onClick={handleGenerateOffer}
                      className="w-full h-10 text-xs font-semibold mt-4 gap-1.5"
                    >
                      <FileText size={14} />
                      Generate Offer
                    </Button>
                  </div>

                  {/* At a Glance */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">At a Glance</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Unit no.</span>
                        <span className="text-xs font-semibold">{unit.unit_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total area</span>
                        <span className="text-xs font-semibold">{formatNumber(unit.total_area)} sq.ft</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Location</span>
                        <span className="text-xs font-semibold">{unit.projects?.location ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Project</span>
                        <span className="text-xs font-semibold">{unit.projects?.name ?? "—"}</span>
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
                <h3 className="text-sm font-bold mb-4">Overview</h3>
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
                  {unit.sub_type && (
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Sub-type</p>
                      <p className="text-xs font-semibold">{unit.sub_type}</p>
                    </div>
                  )}
                  {unit.view && (
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">View</p>
                      <p className="text-xs font-semibold">{unit.view}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Area + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Area Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold mb-4">Area breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Internal</span>
                      <span className="text-xs font-semibold">{formatNumber(unit.internal_area)} sq.ft</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">External</span>
                      <span className="text-xs font-semibold">{formatNumber(unit.external_area)} sq.ft</span>
                    </div>
                    {unit.plot_area != null && unit.plot_area > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Plot</span>
                        <span className="text-xs font-semibold">{formatNumber(unit.plot_area)} sq.ft</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-semibold">Total</span>
                      <span className="text-xs font-bold">{formatNumber(unit.total_area)} sq.ft</span>
                    </div>
                  </div>
                </div>

                {/* Payment Plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold">Payment plan</h3>
                    {unit.payment_plan && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {unit.payment_plan}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Down Payment</p>
                        <p className="text-[10px] text-gray-400">On booking</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">AED {formatNumber(Math.round(unit.price_aed * 0.1))}</p>
                        <p className="text-[10px] text-gray-400">10%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">During Construction</p>
                        <p className="text-[10px] text-gray-400">Installments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">AED {formatNumber(Math.round(unit.price_aed * 0.6))}</p>
                        <p className="text-[10px] text-gray-400">60%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">On Handover</p>
                        <p className="text-[10px] text-gray-400">Completion</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">AED {formatNumber(Math.round(unit.price_aed * 0.3))}</p>
                        <p className="text-[10px] text-gray-400">30%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-semibold">Total</span>
                      <span className="text-xs font-bold">AED {formatNumber(unit.price_aed)}</span>
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
