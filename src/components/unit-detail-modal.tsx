"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UnitWithProject } from "@/lib/types";

interface UnitDetailModalProps {
  unit: UnitWithProject | null;
  open: boolean;
  onClose: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtPrice(n: number): string {
  return `AED ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{unit.unit_number}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {unit.projects?.name ?? unit.project_id} — {unit.projects?.location}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <Badge>{unit.category}</Badge>
            <Badge variant="outline">{unit.bedrooms}</Badge>
            {unit.sub_type && <Badge variant="outline">Type {unit.sub_type}</Badge>}
            <Badge
              variant={
                unit.status === "Available"
                  ? "default"
                  : unit.status === "Reserved"
                  ? "secondary"
                  : "destructive"
              }
            >
              {unit.status}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Unit Details</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {unit.floor && (
                <>
                  <dt className="text-muted-foreground">Floor / Plot</dt>
                  <dd>{unit.floor}</dd>
                </>
              )}
              {unit.view && (
                <>
                  <dt className="text-muted-foreground">View</dt>
                  <dd>{unit.view}</dd>
                </>
              )}
              {unit.payment_plan && (
                <>
                  <dt className="text-muted-foreground">Payment Plan</dt>
                  <dd>{unit.payment_plan}</dd>
                </>
              )}
              {unit.projects?.handover && (
                <>
                  <dt className="text-muted-foreground">Handover</dt>
                  <dd>{unit.projects.handover}</dd>
                </>
              )}
            </dl>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Area Breakdown</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Internal Area</dt>
              <dd>{fmt(unit.internal_area)} sq.ft</dd>
              <dt className="text-muted-foreground">External Area</dt>
              <dd>{fmt(unit.external_area)} sq.ft</dd>
              <dt className="text-muted-foreground font-medium">Total Area</dt>
              <dd className="font-medium">{fmt(unit.total_area)} sq.ft</dd>
              {unit.plot_area && (
                <>
                  <dt className="text-muted-foreground">Plot Area</dt>
                  <dd>{fmt(unit.plot_area)} sq.ft</dd>
                </>
              )}
            </dl>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Pricing</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="text-lg font-bold text-primary">
                {fmtPrice(unit.price_aed)}
              </dd>
              <dt className="text-muted-foreground">Price / sq.ft</dt>
              <dd>{fmtPrice(pricePerSqft)}</dd>
            </dl>
          </div>

          <Separator />

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerateOffer}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Sales Offer (PDF)"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
