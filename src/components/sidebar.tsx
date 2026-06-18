"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Admin", href: "/admin", icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[200px] min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <h1 className="text-base font-bold tracking-wider uppercase leading-none">
          Reportage
        </h1>
        <p className="text-[9px] tracking-[0.25em] uppercase text-primary font-medium">
          Properties
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Branding */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-black font-bold text-sm">
            R.
          </div>
          <div>
            <p className="text-[10px] font-semibold leading-tight">Building Communities.</p>
            <p className="text-[10px] font-semibold leading-tight">Building Trust.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
