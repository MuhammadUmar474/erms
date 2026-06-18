"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin-layout";
import { useCachedData } from "@/hooks/use-cached-data";
import { Search, RefreshCw } from "lucide-react";
import type { Project, UnitWithProject } from "@/lib/types";
import {
  getProjects,
  getUnits,
  createProject,
  updateProject,
  deleteProject,
} from "../actions";

async function fetchAdminData() {
  const [projects, units] = await Promise.all([getProjects(), getUnits()]);
  return { projects: projects as Project[], units: units as UnitWithProject[] };
}

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isRevalidating, refresh } = useCachedData({
    cacheKey: "admin_data",
    fetcher: fetchAdminData,
  });

  const projects = data?.projects ?? [];

  const filteredProjects = search.trim()
    ? projects.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q) ||
          (p.type ?? "").toLowerCase().includes(q) ||
          (p.handover ?? "").toLowerCase().includes(q)
        );
      })
    : projects;

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const paginatedProjects = filteredProjects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = (fd.get("id") as string)?.trim();
    const name = (fd.get("name") as string)?.trim();
    const errs: Record<string, string> = {};
    if (!id) errs.id = "Required";
    else if (!/^[A-Za-z0-9_-]+$/.test(id)) errs.id = "Letters, numbers, - or _ only";
    if (!name) errs.name = "Required";
    if (Object.keys(errs).length > 0) {
      setProjectErrors(errs);
      return;
    }
    setProjectErrors({});
    const formData = {
      id,
      name,
      location: (fd.get("location") as string)?.trim() || "",
      type: (fd.get("type") as string)?.trim() || "",
      handover: (fd.get("handover") as string)?.trim() || "",
    };
    if (editingProject) {
      const { id: _id, ...updates } = formData;
      await updateProject(editingProject.id, updates);
    } else {
      await createProject(formData);
    }
    setProjectFormOpen(false);
    setEditingProject(null);
    refresh();
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("This will delete the project and ALL its units. Are you sure?")) return;
    await deleteProject(id);
    refresh();
  };

  return (
    <AdminLayout title="Manage Projects">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">
            Projects ({filteredProjects.length}{search.trim() ? `/${projects.length}` : ""})
          </h2>
          {isRevalidating && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => {
            setEditingProject(null);
            setProjectFormOpen(true);
          }}
        >
          + Add Project
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search projects by ID, name, location, type..."
          className="h-8 text-xs pl-8 bg-white border-gray-200"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-xs text-gray-400">
          Loading projects...
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-black text-primary">
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">ID</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">NAME</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">LOCATION</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">TYPE</th>
                  <th className="px-3 py-2.5 text-left font-semibold tracking-wider">HANDOVER</th>
                  <th className="px-3 py-2.5 text-right font-semibold tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProjects.map((project, idx) => (
                  <tr key={project.id} className={idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-3 py-2 font-mono">{project.id}</td>
                    <td className="px-3 py-2 font-medium">{project.name}</td>
                    <td className="px-3 py-2">{project.location}</td>
                    <td className="px-3 py-2">{project.type}</td>
                    <td className="px-3 py-2">{project.handover ?? "\u2014"}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button
                          className="px-2 py-1 rounded text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setEditingProject(project);
                            setProjectFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      {search.trim() ? "No projects match your search." : "No projects yet. Add your first project."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredProjects.length > rowsPerPage && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[10px] text-gray-400">
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredProjects.length)} of {filteredProjects.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-[10px] text-gray-300 px-0.5">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-6 h-6 rounded text-[10px] font-medium ${p === page ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Form Dialog */}
      <Dialog
        open={projectFormOpen}
        onOpenChange={(v) => {
          if (!v) {
            setProjectFormOpen(false);
            setEditingProject(null);
            setProjectErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleProjectSubmit} className="px-5 pb-5 pt-3 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Project ID *</label>
              <Input
                name="id"
                defaultValue={editingProject?.id ?? ""}
                placeholder="e.g. VH, RH, T1"
                required
                disabled={!!editingProject}
                className={`h-9 text-xs mt-1 bg-gray-50/80 border-gray-200 ${projectErrors.id ? "!border-red-300" : ""}`}
              />
              {projectErrors.id && <p className="text-[10px] text-red-500 mt-0.5">{projectErrors.id}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Name *</label>
              <Input
                name="name"
                defaultValue={editingProject?.name ?? ""}
                placeholder="e.g. Verdana 8"
                required
                className={`h-9 text-xs mt-1 bg-gray-50/80 border-gray-200 ${projectErrors.name ? "!border-red-300" : ""}`}
              />
              {projectErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{projectErrors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Location</label>
              <Input
                name="location"
                defaultValue={editingProject?.location ?? ""}
                placeholder="e.g. Dubai Investment Park"
                className="h-9 text-xs mt-1 bg-gray-50/80 border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Type</label>
              <Input
                name="type"
                defaultValue={editingProject?.type ?? ""}
                placeholder="e.g. Apartments & Townhouses"
                className="h-9 text-xs mt-1 bg-gray-50/80 border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Handover</label>
              <Input
                name="handover"
                defaultValue={editingProject?.handover ?? ""}
                placeholder="e.g. Q4 2027"
                className="h-9 text-xs mt-1 bg-gray-50/80 border-gray-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setProjectFormOpen(false);
                  setEditingProject(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                {editingProject ? "Update" : "Add Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
