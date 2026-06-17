"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminUnitForm from "@/components/admin-unit-form";
import { useCachedData } from "@/hooks/use-cached-data";
import { Search, RefreshCw } from "lucide-react";
import type { Project, Unit, UnitWithProject } from "@/lib/types";
import {
  verifyAdminPassword,
  getProjects,
  getUnits,
  createProject,
  updateProject,
  deleteProject,
  createUnit,
  updateUnit,
  deleteUnit,
} from "./actions";

async function fetchAdminData() {
  const [projects, units] = await Promise.all([getProjects(), getUnits()]);
  return { projects: projects as Project[], units: units as UnitWithProject[] };
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("erms_admin_auth") === "true";
    }
    return false;
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

  const [tab, setTab] = useState<"units" | "projects">("units");
  const [search, setSearch] = useState("");
  const [unitsPage, setUnitsPage] = useState(1);
  const [projectsPage, setProjectsPage] = useState(1);
  const rowsPerPage = 25;

  // Unit form
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Project form
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});

  // SWR cached data — only fetch when authenticated
  const { data, isLoading, isRevalidating, refresh } = useCachedData({
    cacheKey: "admin_data",
    fetcher: fetchAdminData,
    enabled: authenticated,
  });

  const projects = data?.projects ?? [];
  const units = data?.units ?? [];

  // Filter units by search
  const filteredUnits = search.trim()
    ? units.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.unit_number.toLowerCase().includes(q) ||
          (u.projects?.name ?? "").toLowerCase().includes(q) ||
          u.category.toLowerCase().includes(q) ||
          u.bedrooms.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q)
        );
      })
    : units;

  // Pagination
  const unitsTotalPages = Math.max(1, Math.ceil(filteredUnits.length / rowsPerPage));
  const paginatedUnits = filteredUnits.slice((unitsPage - 1) * rowsPerPage, unitsPage * rowsPerPage);
  const projectsTotalPages = Math.max(1, Math.ceil(projects.length / rowsPerPage));
  const paginatedProjects = projects.slice((projectsPage - 1) * rowsPerPage, projectsPage * rowsPerPage);

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setUnitsPage(1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await verifyAdminPassword(password);
    if (valid) {
      setAuthenticated(true);
      sessionStorage.setItem("erms_admin_auth", "true");
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Unit handlers
  const handleUnitSubmit = async (data: Record<string, unknown>) => {
    if (editingUnit) {
      await updateUnit(editingUnit.id, data);
    } else {
      await createUnit(data as Parameters<typeof createUnit>[0]);
    }
    refresh();
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    await deleteUnit(id);
    refresh();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateUnit(id, { status });
    refresh();
  };

  // Project handlers
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
    const data = {
      id,
      name,
      location: (fd.get("location") as string)?.trim() || "",
      type: (fd.get("type") as string)?.trim() || "",
      handover: (fd.get("handover") as string)?.trim() || "",
    };
    if (editingProject) {
      const { id: _id, ...updates } = data;
      await updateProject(editingProject.id, updates);
    } else {
      await createProject(data);
    }
    setProjectFormOpen(false);
    setEditingProject(null);
    refresh();
  };

  const handleDeleteProject = async (id: string) => {
    if (
      !confirm(
        "This will delete the project and ALL its units. Are you sure?"
      )
    )
      return;
    await deleteProject(id);
    refresh();
  };

  // --- Login screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xs">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-5">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-black font-bold text-sm mx-auto mb-2">
                R.
              </div>
              <h1 className="text-sm font-semibold">Admin Panel</h1>
              <p className="text-[11px] text-gray-400">Enter password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label htmlFor="password" className="text-[10px] font-medium text-gray-500 mb-1 block">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-9 text-xs bg-gray-50/80 border-gray-200"
                  autoFocus
                />
                {authError && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Incorrect password.
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full h-9 text-xs font-semibold">
                Login
              </Button>
            </form>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3">
            Reportage Properties &mdash; ERMS
          </p>
        </div>
      </div>
    );
  }

  // --- Admin dashboard ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-12 border-b border-gray-200 bg-white">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-black font-bold text-xs">
              R.
            </div>
            <h1 className="text-sm font-semibold">Admin Panel</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setAuthenticated(false);
              sessionStorage.removeItem("erms_admin_auth");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab("units")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "units"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Units ({filteredUnits.length}{search.trim() ? `/${units.length}` : ""})
          </button>
          <button
            onClick={() => setTab("projects")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "projects"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Projects ({projects.length})
          </button>
        </div>

        {/* Units Tab */}
        {tab === "units" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Manage Units</h2>
                {isRevalidating && (
                  <RefreshCw className="size-3.5 text-gray-400 animate-spin" />
                )}
              </div>
              <Button
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => {
                  setEditingUnit(null);
                  setUnitFormOpen(true);
                }}
              >
                + Add Unit
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search units by number, project, type, bedrooms..."
                className="h-8 text-xs pl-8 bg-white border-gray-200"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-xs text-gray-400">
                Loading units...
              </div>
            ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-black text-primary">
                      <th className="px-3 py-2.5 text-left font-semibold tracking-wider">UNIT #</th>
                      <th className="px-3 py-2.5 text-left font-semibold tracking-wider">PROJECT</th>
                      <th className="px-3 py-2.5 text-left font-semibold tracking-wider">TYPE</th>
                      <th className="px-3 py-2.5 text-left font-semibold tracking-wider">BEDROOMS</th>
                      <th className="px-3 py-2.5 text-right font-semibold tracking-wider">PRICE (AED)</th>
                      <th className="px-3 py-2.5 text-left font-semibold tracking-wider">STATUS</th>
                      <th className="px-3 py-2.5 text-right font-semibold tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUnits.map((unit, idx) => (
                      <tr key={unit.id} className={idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"}>
                        <td className="px-3 py-2 font-medium">{unit.unit_number}</td>
                        <td className="px-3 py-2">{unit.projects?.name ?? unit.project_id}</td>
                        <td className="px-3 py-2">{unit.category}</td>
                        <td className="px-3 py-2">{unit.bedrooms}</td>
                        <td className="px-3 py-2 text-right">{unit.price_aed.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <select
                            value={unit.status}
                            onChange={(e) => handleStatusChange(unit.id, e.target.value)}
                            className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white"
                          >
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Sold">Sold</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-0.5">
                            <button
                              className="px-2 py-1 rounded text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setEditingUnit(unit);
                                setUnitFormOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 py-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteUnit(unit.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedUnits.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          {search.trim() ? "No units match your search." : "No units yet. Add your first unit."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredUnits.length > rowsPerPage && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400">
                    {(unitsPage - 1) * rowsPerPage + 1}–{Math.min(unitsPage * rowsPerPage, filteredUnits.length)} of {filteredUnits.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setUnitsPage((p) => Math.max(1, p - 1))}
                      disabled={unitsPage === 1}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: unitsTotalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === unitsTotalPages || Math.abs(p - unitsPage) <= 1)
                      .map((p, i, arr) => (
                        <span key={p} className="flex items-center">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-[10px] text-gray-300 px-0.5">...</span>}
                          <button
                            onClick={() => setUnitsPage(p)}
                            className={`w-6 h-6 rounded text-[10px] font-medium ${p === unitsPage ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setUnitsPage((p) => Math.min(unitsTotalPages, p + 1))}
                      disabled={unitsPage === unitsTotalPages}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            <AdminUnitForm
              open={unitFormOpen}
              onClose={() => {
                setUnitFormOpen(false);
                setEditingUnit(null);
              }}
              onSubmit={handleUnitSubmit}
              projects={projects}
              unit={editingUnit}
            />
          </div>
        )}

        {/* Projects Tab */}
        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Manage Projects</h2>
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
                          No projects yet. Add your first project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {projects.length > rowsPerPage && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400">
                    {(projectsPage - 1) * rowsPerPage + 1}–{Math.min(projectsPage * rowsPerPage, projects.length)} of {projects.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProjectsPage((p) => Math.max(1, p - 1))}
                      disabled={projectsPage === 1}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: projectsTotalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === projectsTotalPages || Math.abs(p - projectsPage) <= 1)
                      .map((p, i, arr) => (
                        <span key={p} className="flex items-center">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-[10px] text-gray-300 px-0.5">...</span>}
                          <button
                            onClick={() => setProjectsPage(p)}
                            className={`w-6 h-6 rounded text-[10px] font-medium ${p === projectsPage ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setProjectsPage((p) => Math.min(projectsTotalPages, p + 1))}
                      disabled={projectsPage === projectsTotalPages}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
