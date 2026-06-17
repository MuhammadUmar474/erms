"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { UnitWithProject } from "@/lib/types";

interface UnitDetailModalProps {
  unit: UnitWithProject | null;
  open: boolean;
  onClose: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

export default function UnitDetailModal({
  unit,
  open,
  onClose,
}: UnitDetailModalProps) {
  const [generating, setGenerating] = useState(false);

  if (!unit) return null;

  const handleGenerateOffer = async () => {
    setGenerating(true);
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
    } catch (err) {
      console.error(err);
      alert("Failed to generate offer. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const pricePerSqft = unit.total_area > 0 ? unit.price_aed / unit.total_area : 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-sm !gap-0 !p-0 overflow-y-auto">
        {/* Header */}
        <SheetHeader className="!p-4 !pb-3 border-b border-gray-100">
          <SheetTitle className="!text-sm font-bold">{unit.unit_number}</SheetTitle>
          <SheetDescription className="!text-[11px] !mt-0">
            {unit.projects?.name ?? unit.project_id} — {unit.projects?.location}
          </SheetDescription>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-black">
              {unit.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200 text-gray-700">
              {unit.bedrooms}
            </span>
            {unit.sub_type && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200 text-gray-700">
                Type {unit.sub_type}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-black">
              {unit.status}
            </span>
          </div>
        </SheetHeader>

        {/* Price highlight */}
        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
          <p className="text-[10px] text-gray-500 mb-0.5">Price</p>
          <p className="text-lg font-bold text-primary leading-tight">
            AED {fmt(unit.price_aed)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            AED {fmt(Math.round(pricePerSqft))} / sq.ft
          </p>
        </div>

        {/* Details */}
        <div className="px-4 py-3 space-y-3">
          {/* Unit Details */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Unit Details
            </h4>
            {unit.floor && <DetailRow label="Floor / Plot" value={unit.floor} />}
            {unit.view && <DetailRow label="View" value={unit.view} />}
            {unit.payment_plan && <DetailRow label="Payment Plan" value={unit.payment_plan} />}
            {unit.projects?.handover && (
              <DetailRow label="Handover" value={unit.projects.handover} />
            )}
          </div>

          {/* Area */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Area Breakdown
            </h4>
            <DetailRow label="Internal Area" value={`${fmt(unit.internal_area)} sq.ft`} />
            <DetailRow label="External Area" value={`${fmt(unit.external_area)} sq.ft`} />
            <DetailRow label="Total Area" value={`${fmt(unit.total_area)} sq.ft`} bold />
            {unit.plot_area && (
              <DetailRow label="Plot Area" value={`${fmt(unit.plot_area)} sq.ft`} />
            )}
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-4 pt-1">
          <Button
            className="w-full h-9 text-xs font-semibold gap-2"
            onClick={handleGenerateOffer}
            disabled={generating}
          >
            <FileDown size={14} />
            {generating ? "Generating..." : "Generate Sales Offer (PDF)"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
