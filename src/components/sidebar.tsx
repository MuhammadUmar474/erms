"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderKanban, Building2, Settings, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Inventory", href: "/inventory", icon: Building2 },
  { label: "Settings", href: "/admin", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <Image
          src="/reportage_logo.png"
          alt="Reportage"
          width={160}
          height={36}
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold shrink-0">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-tight">Saif Jafri</p>
            <p className="text-[11px] text-gray-400 leading-tight">Director</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
