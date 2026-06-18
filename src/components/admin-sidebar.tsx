"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FolderKanban, LogOut } from "lucide-react";

interface AdminSidebarProps {
  onLogout: () => void;
}

const navItems = [
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Units", href: "/admin/units", icon: Building2 },
];

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[200px] min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <h1 className="text-base font-bold tracking-wider uppercase leading-none">
          Reportage
        </h1>
        <p className="text-[9px] tracking-[0.25em] uppercase text-primary font-medium">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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

      {/* Bottom */}
      <div className="px-2.5 pb-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </button>
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] text-gray-400 hover:text-black hover:bg-gray-50 transition-colors mt-0.5"
        >
          &larr; Back to App
        </Link>
      </div>
    </aside>
  );
}
