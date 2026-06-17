import InventoryBrowser from "@/components/inventory-browser";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Inventory" />
        <main className="flex-1 p-4">
          <InventoryBrowser />
        </main>
        <footer className="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>&copy; 2026 Reportage Properties. All rights reserved.</span>
          <span>All information is subject to change without notice.</span>
        </footer>
      </div>
    </div>
  );
}
