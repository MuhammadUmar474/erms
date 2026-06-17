import { supabase } from "@/lib/supabase";
import type { Project, UnitWithProject } from "@/lib/types";
import InventoryBrowser from "@/components/inventory-browser";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("name");

  const { data: units } = await supabase
    .from("units")
    .select("*, projects(*)")
    .order("unit_number");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Inventory" />
        <main className="flex-1 p-4">
          <InventoryBrowser
            projects={(projects as Project[]) ?? []}
            units={(units as UnitWithProject[]) ?? []}
          />
        </main>
        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>&copy; 2026 Reportage Properties. All rights reserved.</span>
          <span>All information is subject to change without notice.</span>
        </footer>
      </div>
    </div>
  );
}
