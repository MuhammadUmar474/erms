"use server";

import { supabase } from "@/lib/supabase";

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getUnits() {
  const { data, error } = await supabase
    .from("units")
    .select("*, projects(*)")
    .order("unit_number");
  if (error) throw error;
  return data;
}

export async function createProject(project: {
  id: string;
  name: string;
  location: string;
  type: string;
  handover: string;
}) {
  const { error } = await supabase.from("projects").insert(project);
  if (error) throw error;
}

export async function updateProject(
  id: string,
  updates: { name?: string; location?: string; type?: string; handover?: string }
) {
  const { error } = await supabase.from("projects").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function createUnit(unit: {
  unit_number: string;
  project_id: string;
  category: string;
  bedrooms: string;
  sub_type?: string;
  view?: string;
  floor?: string;
  internal_area: number;
  external_area: number;
  total_area: number;
  plot_area?: number;
  price_aed: number;
  payment_plan?: string;
  status: string;
}) {
  const { error } = await supabase.from("units").insert(unit);
  if (error) throw error;
}

export async function updateUnit(
  id: number,
  updates: Record<string, unknown>
) {
  const { error } = await supabase.from("units").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteUnit(id: number) {
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) throw error;
}
