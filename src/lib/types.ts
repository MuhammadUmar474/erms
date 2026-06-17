export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  handover: string | null;
  created_at: string;
}

export interface Unit {
  id: number;
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
  status: "Available" | "Reserved" | "Sold";
  created_at: string;
  // joined
  project?: Project;
}

export interface UnitWithProject extends Unit {
  projects: Project;
}
