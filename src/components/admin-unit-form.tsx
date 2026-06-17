"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const labelClass = "text-[11px] font-medium text-gray-500 block";
const inputClass = "!h-7 text-[11px] bg-gray-50/80 border-gray-200 mt-1 !ring-0 !ring-offset-0 focus-visible:!ring-1 focus-visible:!ring-gray-300 focus-visible:!border-gray-300";
const selectClass =
  "flex h-7 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-2 text-[11px] outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 mt-1";

export default function AdminUnitForm({
  open,
  onClose,
  onSubmit,
  projects,
  unit,
}: AdminUnitFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (fd: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!(fd.get("unit_number") as string)?.trim()) errs.unit_number = "Required";
    if (!fd.get("project_id")) errs.project_id = "Select a project";
    if (!fd.get("bedrooms")) errs.bedrooms = "Select bedrooms";
    const internalArea = parseFloat(fd.get("internal_area") as string);
    const externalArea = parseFloat(fd.get("external_area") as string);
    const totalArea = parseFloat(fd.get("total_area") as string);
    const price = parseFloat(fd.get("price_aed") as string);
    if (!internalArea || internalArea <= 0) errs.internal_area = "Must be > 0";
    if (isNaN(externalArea) || externalArea < 0) errs.external_area = "Must be >= 0";
    if (!totalArea || totalArea <= 0) errs.total_area = "Must be > 0";
    if (!price || price <= 0) errs.price_aed = "Must be > 0";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const validationErrors = validate(fd);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const data: Record<string, unknown> = {
      unit_number: (fd.get("unit_number") as string).trim(),
      project_id: fd.get("project_id"),
      category: fd.get("category"),
      bedrooms: fd.get("bedrooms"),
      sub_type: (fd.get("sub_type") as string)?.trim() || null,
      view: (fd.get("view") as string)?.trim() || null,
      floor: (fd.get("floor") as string)?.trim() || null,
      internal_area: parseFloat(fd.get("internal_area") as string) || 0,
      external_area: parseFloat(fd.get("external_area") as string) || 0,
      total_area: parseFloat(fd.get("total_area") as string) || 0,
      plot_area: fd.get("plot_area") ? parseFloat(fd.get("plot_area") as string) : null,
      price_aed: parseFloat(fd.get("price_aed") as string) || 0,
      payment_plan: (fd.get("payment_plan") as string)?.trim() || null,
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

  const fieldError = (name: string) =>
    errors[name] ? <p className="text-[10px] text-red-500 mt-0.5">{errors[name]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 pt-4 pb-2.5 border-b border-gray-100">
          <DialogTitle className="text-sm font-semibold">
            {unit ? "Edit Unit" : "Add New Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {/* Row 1 */}
            <div>
              <label className={labelClass}>Unit Number *</label>
              <Input
                name="unit_number"
                defaultValue={unit?.unit_number ?? ""}
                required
                className={`${inputClass} ${errors.unit_number ? "!border-red-300" : ""}`}
              />
              {fieldError("unit_number")}
            </div>
            <div>
              <label className={labelClass}>Project *</label>
              <select
                name="project_id"
                defaultValue={unit?.project_id ?? ""}
                required
                className={`${selectClass} ${errors.project_id ? "!border-red-300" : ""}`}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {fieldError("project_id")}
            </div>

            {/* Row 2 */}
            <div>
              <label className={labelClass}>Category *</label>
              <select
                name="category"
                defaultValue={unit?.category ?? "Apartment"}
                required
                className={selectClass}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bedrooms *</label>
              <select
                name="bedrooms"
                defaultValue={unit?.bedrooms ?? ""}
                required
                className={`${selectClass} ${errors.bedrooms ? "!border-red-300" : ""}`}
              >
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {fieldError("bedrooms")}
            </div>

            {/* Row 3 */}
            <div>
              <label className={labelClass}>Sub-type</label>
              <Input
                name="sub_type"
                defaultValue={unit?.sub_type ?? ""}
                placeholder="A, B, C, D..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>View</label>
              <Input
                name="view"
                defaultValue={unit?.view ?? ""}
                placeholder="Pool, Street..."
                className={inputClass}
              />
            </div>

            {/* Row 4 */}
            <div>
              <label className={labelClass}>Floor / Plot</label>
              <Input
                name="floor"
                defaultValue={unit?.floor ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select
                name="status"
                defaultValue={unit?.status ?? "Available"}
                required
                className={selectClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="col-span-2 border-t border-gray-100 my-0.5" />

            {/* Area fields */}
            <div>
              <label className={labelClass}>Internal Area (sq.ft) *</label>
              <Input
                name="internal_area"
                type="number"
                step="0.01"
                min="0"
                defaultValue={unit?.internal_area ?? ""}
                required
                className={`${inputClass} ${errors.internal_area ? "!border-red-300" : ""}`}
              />
              {fieldError("internal_area")}
            </div>
            <div>
              <label className={labelClass}>External Area (sq.ft) *</label>
              <Input
                name="external_area"
                type="number"
                step="0.01"
                min="0"
                defaultValue={unit?.external_area ?? ""}
                required
                className={`${inputClass} ${errors.external_area ? "!border-red-300" : ""}`}
              />
              {fieldError("external_area")}
            </div>
            <div>
              <label className={labelClass}>Total Area (sq.ft) *</label>
              <Input
                name="total_area"
                type="number"
                step="0.01"
                min="0"
                defaultValue={unit?.total_area ?? ""}
                required
                className={`${inputClass} ${errors.total_area ? "!border-red-300" : ""}`}
              />
              {fieldError("total_area")}
            </div>
            <div>
              <label className={labelClass}>Plot Area (sq.ft)</label>
              <Input
                name="plot_area"
                type="number"
                step="0.01"
                min="0"
                defaultValue={unit?.plot_area ?? ""}
                placeholder="Townhouses only"
                className={inputClass}
              />
            </div>

            {/* Divider */}
            <div className="col-span-2 border-t border-gray-100 my-0.5" />

            {/* Pricing */}
            <div>
              <label className={labelClass}>Price (AED) *</label>
              <Input
                name="price_aed"
                type="number"
                step="0.01"
                min="0"
                defaultValue={unit?.price_aed ?? ""}
                required
                className={`${inputClass} ${errors.price_aed ? "!border-red-300" : ""}`}
              />
              {fieldError("price_aed")}
            </div>
            <div>
              <label className={labelClass}>Payment Plan</label>
              <Input
                name="payment_plan"
                defaultValue={unit?.payment_plan ?? ""}
                placeholder="Normal, Investor 30%..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading}>
              {loading ? "Saving..." : unit ? "Update Unit" : "Add Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
