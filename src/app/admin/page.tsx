"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminUnitForm from "@/components/admin-unit-form";
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<UnitWithProject[]>([]);
  const [tab, setTab] = useState<"units" | "projects">("units");

  // Unit form
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Project form
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadData = useCallback(async () => {
    const [p, u] = await Promise.all([getProjects(), getUnits()]);
    setProjects(p as Project[]);
    setUnits(u as UnitWithProject[]);
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await verifyAdminPassword(password);
    if (valid) {
      setAuthenticated(true);
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
    await loadData();
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    await deleteUnit(id);
    await loadData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateUnit(id, { status });
    await loadData();
  };

  // Project handlers
  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      id: fd.get("id") as string,
      name: fd.get("name") as string,
      location: fd.get("location") as string,
      type: fd.get("type") as string,
      handover: fd.get("handover") as string,
    };
    if (editingProject) {
      const { id: _id, ...updates } = data;
      await updateProject(editingProject.id, updates);
    } else {
      await createProject(data);
    }
    setProjectFormOpen(false);
    setEditingProject(null);
    await loadData();
  };

  const handleDeleteProject = async (id: string) => {
    if (
      !confirm(
        "This will delete the project and ALL its units. Are you sure?"
      )
    )
      return;
    await deleteProject(id);
    await loadData();
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
            onClick={() => setAuthenticated(false)}
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
            Units ({units.length})
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
              <h2 className="text-sm font-semibold">Manage Units</h2>
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
                    {units.map((unit, idx) => (
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
                    {units.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          No units yet. Add your first unit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
                    {projects.map((project, idx) => (
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
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          No projects yet. Add your first project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Form Dialog */}
            <Dialog
              open={projectFormOpen}
              onOpenChange={(v) => {
                if (!v) {
                  setProjectFormOpen(false);
                  setEditingProject(null);
                }
              }}
            >
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold">
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Project ID *</label>
                    <Input
                      name="id"
                      defaultValue={editingProject?.id ?? ""}
                      placeholder="e.g. VH, RH, T1"
                      required
                      disabled={!!editingProject}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Name *</label>
                    <Input
                      name="name"
                      defaultValue={editingProject?.name ?? ""}
                      placeholder="e.g. Verdana 8"
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Location</label>
                    <Input
                      name="location"
                      defaultValue={editingProject?.location ?? ""}
                      placeholder="e.g. Dubai Investment Park"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Type</label>
                    <Input
                      name="type"
                      defaultValue={editingProject?.type ?? ""}
                      placeholder="e.g. Apartments & Townhouses"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Handover</label>
                    <Input
                      name="handover"
                      defaultValue={editingProject?.handover ?? ""}
                      placeholder="e.g. Q4 2027"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
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
