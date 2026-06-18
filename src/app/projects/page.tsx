"use client";

import { useCallback } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { useCachedData } from "@/hooks/use-cached-data";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const fetcher = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as Project[];
  }, []);

  const { data: projects, isLoading, isRevalidating } = useCachedData({
    cacheKey: "projects",
    fetcher,
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Projects" />
        <main className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold">All Projects</h2>
            {isRevalidating && (
              <RefreshCw className="size-3.5 text-gray-400 animate-spin" />
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-xs text-gray-400">
              Loading projects...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(projects ?? []).map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xs font-semibold text-black">{project.name}</h3>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {project.id}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {project.location && (
                      <p className="text-[11px] text-gray-500">{project.location}</p>
                    )}
                    {project.type && (
                      <p className="text-[11px] text-gray-400">{project.type}</p>
                    )}
                    {project.handover && (
                      <p className="text-[10px] text-primary font-medium mt-1.5">
                        Handover: {project.handover}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <footer className="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>&copy; 2026 Reportage Properties. All rights reserved.</span>
          <span>All information is subject to change without notice.</span>
        </footer>
      </div>
    </div>
  );
}
