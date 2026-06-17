"use client";

import { Building2, LayoutGrid } from "lucide-react";
import type { UnitWithProject, Project } from "@/lib/types";

interface StatsCardsProps {
  units: UnitWithProject[];
  projects: Project[];
}

export default function StatsCards({ units, projects }: StatsCardsProps) {
  const stats = [
    { label: "Available Units", value: units.length, icon: Building2 },
    { label: "Projects", value: projects.length, icon: LayoutGrid },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
            <stat.icon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
