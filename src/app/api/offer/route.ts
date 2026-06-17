import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase";
import type { UnitWithProject } from "@/lib/types";
import OfferPDF from "@/components/offer-pdf";
import React from "react";

export async function POST(req: NextRequest) {
  try {
    const { unitId } = await req.json();

    if (!unitId) {
      return NextResponse.json({ error: "unitId is required" }, { status: 400 });
    }

    const { data: unit, error } = await supabase
      .from("units")
      .select("*, projects(*)")
      .eq("id", unitId)
      .single();

    if (error || !unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(OfferPDF, { unit: unit as UnitWithProject }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Offer_${unit.unit_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
