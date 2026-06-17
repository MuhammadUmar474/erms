"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, Unit } from "@/lib/types";

interface AdminUnitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  projects: Project[];
  unit?: Unit | null;
}

const BEDROOM_OPTIONS = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];
const CATEGORY_OPTIONS = ["Apartment", "Townhouse"];
const STATUS_OPTIONS = ["Available", "Reserved", "Sold"];

export default function AdminUnitForm({
  open,
  onClose,
  onSubmit,
  projects,
  unit,
}: AdminUnitFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      unit_number: fd.get("unit_number"),
      project_id: fd.get("project_id"),
      category: fd.get("category"),
      bedrooms: fd.get("bedrooms"),
      sub_type: fd.get("sub_type") || null,
      view: fd.get("view") || null,
      floor: fd.get("floor") || null,
      internal_area: parseFloat(fd.get("internal_area") as string) || 0,
      external_area: parseFloat(fd.get("external_area") as string) || 0,
      total_area: parseFloat(fd.get("total_area") as string) || 0,
      plot_area: fd.get("plot_area") ? parseFloat(fd.get("plot_area") as string) : null,
      price_aed: parseFloat(fd.get("price_aed") as string) || 0,
      payment_plan: fd.get("payment_plan") || null,
      status: fd.get("status"),
    };
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save unit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_number">Unit Number *</Label>
              <Input
                id="unit_number"
                name="unit_number"
                defaultValue={unit?.unit_number ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="project_id">Project *</Label>
              <select
                id="project_id"
                name="project_id"
                defaultValue={unit?.project_id ?? ""}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                defaultValue={unit?.category ?? "Apartment"}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <select
                id="bedrooms"
                name="bedrooms"
                defaultValue={unit?.bedrooms ?? ""}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sub_type">Sub-type</Label>
              <Input
                id="sub_type"
                name="sub_type"
                defaultValue={unit?.sub_type ?? ""}
                placeholder="A, B, C, D..."
              />
            </div>
            <div>
              <Label htmlFor="view">View</Label>
              <Input
                id="view"
                name="view"
                defaultValue={unit?.view ?? ""}
                placeholder="Pool, Street, Community..."
              />
            </div>
            <div>
              <Label htmlFor="floor">Floor / Plot</Label>
              <Input
                id="floor"
                name="floor"
                defaultValue={unit?.floor ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                defaultValue={unit?.status ?? "Available"}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="internal_area">Internal Area (sq.ft) *</Label>
              <Input
                id="internal_area"
                name="internal_area"
                type="number"
                step="0.01"
                defaultValue={unit?.internal_area ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="external_area">External Area (sq.ft) *</Label>
              <Input
                id="external_area"
                name="external_area"
                type="number"
                step="0.01"
                defaultValue={unit?.external_area ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_area">Total Area (sq.ft) *</Label>
              <Input
                id="total_area"
                name="total_area"
                type="number"
                step="0.01"
                defaultValue={unit?.total_area ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="plot_area">Plot Area (sq.ft)</Label>
              <Input
                id="plot_area"
                name="plot_area"
                type="number"
                step="0.01"
                defaultValue={unit?.plot_area ?? ""}
                placeholder="Townhouses only"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_aed">Price (AED) *</Label>
              <Input
                id="price_aed"
                name="price_aed"
                type="number"
                step="0.01"
                defaultValue={unit?.price_aed ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_plan">Payment Plan</Label>
              <Input
                id="payment_plan"
                name="payment_plan"
                defaultValue={unit?.payment_plan ?? ""}
                placeholder="Normal, Investor 30%..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : unit ? "Update Unit" : "Add Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
