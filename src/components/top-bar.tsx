"use client";

import { Menu } from "lucide-react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center px-5">
      <button className="lg:hidden p-1 rounded-md hover:bg-gray-100 mr-3">
        <Menu size={18} />
      </button>
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  );
}
