import { supabase } from "@/lib/supabase";
import type { Project, UnitWithProject } from "@/lib/types";
import InventoryBrowser from "@/components/inventory-browser";

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
    <main className="flex-1">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">R.</h1>
            <p className="text-sm opacity-80">Reportage Properties</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">ERMS</p>
            <p className="text-xs opacity-70">Inventory Management</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Available Properties</h2>
          <p className="text-muted-foreground">
            Browse and filter available units across all Reportage projects.
          </p>
        </div>

        <InventoryBrowser
          projects={(projects as Project[]) ?? []}
          units={(units as UnitWithProject[]) ?? []}
        />
      </div>
    </main>
  );
}
