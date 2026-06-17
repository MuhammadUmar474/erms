/**
 * Seed script — parses Excel availability files and inserts into Supabase.
 *
 * Usage:
 *   npx tsx src/data/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---- Project definitions ----
interface ProjectDef {
  id: string;
  name: string;
  location: string;
  type: string;
  handover: string | null;
}

const PROJECTS: ProjectDef[] = [
  { id: "V1R", name: "Verdana 1 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V1T", name: "Verdana 1 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V2R", name: "Verdana 2 Residence", location: "Dubai Investment Park", type: "Apartments", handover: "Q4 2026" },
  { id: "V2T", name: "Verdana 2 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V3R", name: "Verdana 3 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V3T", name: "Verdana 3 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V4R", name: "Verdana 4 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V4T", name: "Verdana 4 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V5R", name: "Verdana 5 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V5T", name: "Verdana 5 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V6R", name: "Verdana 6 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V6T", name: "Verdana 6 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V7R", name: "Verdana 7 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V7T", name: "Verdana 7 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V8R", name: "Verdana 8 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V8T", name: "Verdana 8 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V9R", name: "Verdana 9 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V9T", name: "Verdana 9 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V10R", name: "Verdana 10 Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V10T", name: "Verdana 10 Townhouse", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "V3K", name: "Verdana 3K Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "V3L", name: "Verdana 3L Residence", location: "Dubai Investment Park", type: "Apartments", handover: null },
  { id: "RH", name: "Reportage Hills", location: "Dubai Hills", type: "Townhouses", handover: null },
  { id: "ALBA", name: "Alba", location: "Dubai", type: "Apartments", handover: "Q4 2027" },
  { id: "RVA", name: "Reportage Village Phase A", location: "Dubai", type: "Mixed", handover: null },
  { id: "RVB", name: "Reportage Village Phase B", location: "Dubai", type: "Mixed", handover: null },
  { id: "T1", name: "Taormina Village 1", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "T1L", name: "Taormina Village 1 Luxury", location: "Dubai Investment Park", type: "Townhouses", handover: "Q4 2027" },
  { id: "T2", name: "Taormina Village 2", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "T2L", name: "Taormina Village 2 Luxury", location: "Dubai Investment Park", type: "Townhouses", handover: null },
  { id: "BIANCA", name: "Bianca", location: "Dubai", type: "Townhouses", handover: null },
  { id: "ALEXIS", name: "Alexis Tower", location: "Dubai", type: "Apartments", handover: null },
];

// ---- Sheet-to-project mapping ----
interface SheetMapping {
  sheetPattern: RegExp;
  projectId: string;
  category: "Apartment" | "Townhouse";
  paymentPlan?: string;
}

const SHEET_MAPPINGS: SheetMapping[] = [
  { sheetPattern: /Verdana 1 Res/i, projectId: "V1R", category: "Apartment" },
  { sheetPattern: /Verdana 1 TH/i, projectId: "V1T", category: "Townhouse" },
  { sheetPattern: /Verdana 2 Res/i, projectId: "V2R", category: "Apartment" },
  { sheetPattern: /Verdana 2 TH/i, projectId: "V2T", category: "Townhouse" },
  { sheetPattern: /VERDANA 3 Res/i, projectId: "V3R", category: "Apartment" },
  { sheetPattern: /VERDANA 3 TH/i, projectId: "V3T", category: "Townhouse" },
  { sheetPattern: /VERDANA 4 Res/i, projectId: "V4R", category: "Apartment" },
  { sheetPattern: /VERDANA TH 4/i, projectId: "V4T", category: "Townhouse" },
  { sheetPattern: /Verdana 5 Res/i, projectId: "V5R", category: "Apartment" },
  { sheetPattern: /Verdana 5 TH/i, projectId: "V5T", category: "Townhouse" },
  { sheetPattern: /Verdana 6 Res/i, projectId: "V6R", category: "Apartment" },
  { sheetPattern: /Verdana 6 TH/i, projectId: "V6T", category: "Townhouse" },
  { sheetPattern: /Verdana 7 Res/i, projectId: "V7R", category: "Apartment" },
  { sheetPattern: /Verdana 7 TH/i, projectId: "V7T", category: "Townhouse" },
  { sheetPattern: /Verdana 8 Res/i, projectId: "V8R", category: "Apartment" },
  { sheetPattern: /Verdana 8 TH/i, projectId: "V8T", category: "Townhouse" },
  { sheetPattern: /Verdana 9 Res/i, projectId: "V9R", category: "Apartment" },
  { sheetPattern: /Verdana 9 TH/i, projectId: "V9T", category: "Townhouse" },
  { sheetPattern: /Verdana 10 Res/i, projectId: "V10R", category: "Apartment" },
  { sheetPattern: /Verdana 10 TH/i, projectId: "V10T", category: "Townhouse" },
  { sheetPattern: /Verdana 3K Res/i, projectId: "V3K", category: "Apartment" },
  { sheetPattern: /Verdana 3L Res/i, projectId: "V3L", category: "Apartment" },
  { sheetPattern: /REPORTAGE HILLS/i, projectId: "RH", category: "Townhouse" },
  { sheetPattern: /ALBA/i, projectId: "ALBA", category: "Apartment" },
  { sheetPattern: /R-VILLAGE PHASE A/i, projectId: "RVA", category: "Townhouse" },
  { sheetPattern: /R- VILLAGE PHASE B/i, projectId: "RVB", category: "Townhouse" },
  { sheetPattern: /Taormina Village 1(?! -)(?!.*LUX)/i, projectId: "T1", category: "Townhouse" },
  { sheetPattern: /Taormina Village.*1.*LUXURY/i, projectId: "T1L", category: "Townhouse" },
  { sheetPattern: /Taormina Village 2(?! -)(?!.*LUX)/i, projectId: "T2", category: "Townhouse" },
  { sheetPattern: /Taormina Village 2.*LUXURY/i, projectId: "T2L", category: "Townhouse" },
  { sheetPattern: /Bianca/i, projectId: "BIANCA", category: "Townhouse" },
  { sheetPattern: /ALEXIS/i, projectId: "ALEXIS", category: "Apartment" },
];

// ---- Column name normalization ----
function findColumn(headers: string[], patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const idx = headers.findIndex((h) => pattern.test(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseNum(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseBedrooms(val: unknown): string {
  if (!val) return "";
  const s = String(val).trim().toUpperCase();
  if (s === "ST" || s.includes("STUDIO")) return "Studio";
  if (s.startsWith("1")) return "1BR";
  if (s.startsWith("2")) return "2BR";
  if (s.startsWith("3")) return "3BR";
  if (s.startsWith("4")) return "4BR";
  if (s.startsWith("5")) return "5BR";
  // Check for patterns like "3B TH"
  const match = s.match(/(\d)B/);
  if (match) return `${match[1]}BR`;
  return s;
}

interface UnitRow {
  unit_number: string;
  project_id: string;
  category: "Apartment" | "Townhouse";
  bedrooms: string;
  sub_type: string | null;
  view: string | null;
  floor: string | null;
  internal_area: number;
  external_area: number;
  total_area: number;
  plot_area: number | null;
  price_aed: number;
  payment_plan: string | null;
  status: string;
}

function parseSheet(
  ws: XLSX.WorkSheet,
  mapping: SheetMapping
): UnitRow[] {
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const units: UnitRow[] = [];

  // Find the header row (look for a row containing "UNIT" or "Number" column patterns)
  let headerIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = (rows[i] || []).map((c) => String(c ?? "").trim().toUpperCase());
    if (
      row.some(
        (h) =>
          h.includes("UNIT") ||
          h.includes("NUMBER") ||
          h.includes("SERIAL") ||
          h === "SN."
      )
    ) {
      headerIdx = i;
      headers = row;
      break;
    }
  }

  if (headerIdx === -1) return units;

  // Find column indices
  const unitNumCol = findColumn(headers, [
    /COMMERCIAL UNIT NUMBER/i,
    /UNIT NUMBER/i,
    /UNI NUMBER/i,
    /^UNIT$/i,
    /^NUMBER$/i,
    /PLOT \+ UNIT/i,
    /NEW COMMERCIAL UNIT/i,
  ]);

  const bedroomsCol = findColumn(headers, [
    /^BEDROOMS$/i,
    /^TYPE$/i,
    /COMMERCIAL UNIT DEF/i,
  ]);

  const subTypeCol = findColumn(headers, [/SUB.?TYPE/i, /^SUB TYPE$/i]);
  const viewCol = findColumn(headers, [/^VIEW$/i]);
  const floorCol = findColumn(headers, [/^FLOOR$/i, /^PHASE$/i]);

  const internalCol = findColumn(headers, [/INTERNAL/i]);
  const externalCol = findColumn(headers, [/EXTERNAL/i, /OUTDOOR/i]);
  const totalCol = findColumn(headers, [/TOTAL.*AREA/i, /TOTAL UNIT/i]);
  const plotCol = findColumn(headers, [/PLOT.*AREA/i]);

  const priceCol = findColumn(headers, [
    /ORIGINAL PRICE.*AED/i,
    /ORIGINAL PRICE/i,
    /PRICE AED/i,
    /TOTAL PRICE/i,
    /^PRICE$/i,
    /PRICES.*AED/i,
    /New Original Price/i,
  ]);

  if (unitNumCol === -1) return units;

  // Parse data rows
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;

    const unitNumber = String(row[unitNumCol] ?? "").trim();
    if (!unitNumber || unitNumber === "None" || unitNumber === "") continue;

    // Skip rows that look like headers or notes
    if (unitNumber.toUpperCase().includes("SERIAL")) continue;
    if (unitNumber.toUpperCase().includes("AVAILABILITY")) continue;
    if (unitNumber.toUpperCase().includes("PAYMENT")) continue;

    const price = parseNum(priceCol >= 0 ? row[priceCol] : 0);
    if (price === 0) continue; // Skip rows without price

    const bedrooms = parseBedrooms(bedroomsCol >= 0 ? row[bedroomsCol] : "");
    if (!bedrooms) continue;

    const internalArea = parseNum(internalCol >= 0 ? row[internalCol] : 0);
    const externalArea = parseNum(externalCol >= 0 ? row[externalCol] : 0);
    let totalArea = parseNum(totalCol >= 0 ? row[totalCol] : 0);
    if (totalArea === 0) totalArea = internalArea + externalArea;

    const plotArea = plotCol >= 0 ? parseNum(row[plotCol]) : null;

    units.push({
      unit_number: unitNumber,
      project_id: mapping.projectId,
      category: mapping.category,
      bedrooms,
      sub_type: subTypeCol >= 0 ? String(row[subTypeCol] ?? "").trim() || null : null,
      view: viewCol >= 0 ? String(row[viewCol] ?? "").trim() || null : null,
      floor: floorCol >= 0 ? String(row[floorCol] ?? "").trim() || null : null,
      internal_area: Math.round(internalArea * 100) / 100,
      external_area: Math.round(externalArea * 100) / 100,
      total_area: Math.round(totalArea * 100) / 100,
      plot_area: plotArea ? Math.round(plotArea * 100) / 100 : null,
      price_aed: Math.round(price),
      payment_plan: mapping.paymentPlan ?? null,
      status: "Available",
    });
  }

  return units;
}

async function seed() {
  console.log("Starting seed...\n");

  // 1. Insert projects
  console.log(`Inserting ${PROJECTS.length} projects...`);
  const { error: projErr } = await supabase
    .from("projects")
    .upsert(PROJECTS, { onConflict: "id" });
  if (projErr) {
    console.error("Failed to insert projects:", projErr);
    return;
  }
  console.log("Projects inserted.\n");

  // 2. Parse Excel files
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const excelDir = path.resolve(homeDir, "Downloads", "Reportage");
  const altDir = path.resolve(homeDir, "Downloads");

  const excelFiles = [
    "UAE DUBAI - VERDANA Projects Availability_16 JUNE 2026.xlsx",
    "UAE DUBAI Projects Availabity_16 JUNE 2026.xlsx",
  ];

  let allUnits: UnitRow[] = [];

  for (const fileName of excelFiles) {
    let filePath = path.join(excelDir, fileName);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(altDir, fileName);
    }
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${fileName}, skipping.`);
      continue;
    }

    console.log(`Parsing: ${fileName}`);
    const wb = XLSX.readFile(filePath);

    for (const sheetName of wb.SheetNames) {
      const mapping = SHEET_MAPPINGS.find((m) => m.sheetPattern.test(sheetName));
      if (!mapping) {
        console.log(`  Skipping unmapped sheet: "${sheetName}"`);
        continue;
      }

      const ws = wb.Sheets[sheetName];
      const units = parseSheet(ws, mapping);
      console.log(`  Sheet "${sheetName}" -> ${mapping.projectId}: ${units.length} units`);
      allUnits = allUnits.concat(units);
    }
  }

  console.log(`\nTotal units parsed: ${allUnits.length}`);

  if (allUnits.length === 0) {
    console.log("No units to insert.");
    return;
  }

  // 3. Clear existing units and insert
  console.log("Clearing existing units...");
  await supabase.from("units").delete().neq("id", 0);

  // Insert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < allUnits.length; i += batchSize) {
    const batch = allUnits.slice(i, i + batchSize);
    const { error } = await supabase.from("units").insert(batch);
    if (error) {
      console.error(`Batch insert error (${i}-${i + batch.length}):`, error);
    } else {
      console.log(`Inserted batch ${i + 1}-${i + batch.length}`);
    }
  }

  console.log("\nSeed complete!");
}

seed().catch(console.error);
