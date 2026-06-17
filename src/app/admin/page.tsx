"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-sm p-6 bg-card rounded-lg border shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">R.</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
              {authError && (
                <p className="text-sm text-destructive mt-1">
                  Incorrect password.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- Admin dashboard ---
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">R.</h1>
            <p className="text-sm opacity-80">Admin Panel</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAuthenticated(false)}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "units" ? "default" : "outline"}
            onClick={() => setTab("units")}
          >
            Units ({units.length})
          </Button>
          <Button
            variant={tab === "projects" ? "default" : "outline"}
            onClick={() => setTab("projects")}
          >
            Projects ({projects.length})
          </Button>
        </div>

        {/* Units Tab */}
        {tab === "units" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Manage Units</h2>
              <Button
                onClick={() => {
                  setEditingUnit(null);
                  setUnitFormOpen(true);
                }}
              >
                + Add Unit
              </Button>
            </div>

            <div className="rounded-md border bg-card overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bedrooms</TableHead>
                    <TableHead className="text-right">Price (AED)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">
                        {unit.unit_number}
                      </TableCell>
                      <TableCell>
                        {unit.projects?.name ?? unit.project_id}
                      </TableCell>
                      <TableCell>{unit.category}</TableCell>
                      <TableCell>{unit.bedrooms}</TableCell>
                      <TableCell className="text-right">
                        {unit.price_aed.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <select
                          value={unit.status}
                          onChange={(e) =>
                            handleStatusChange(unit.id, e.target.value)
                          }
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUnit(unit);
                              setUnitFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteUnit(unit.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {units.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No units yet. Add your first unit.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Manage Projects</h2>
              <Button
                onClick={() => {
                  setEditingProject(null);
                  setProjectFormOpen(true);
                }}
              >
                + Add Project
              </Button>
            </div>

            <div className="rounded-md border bg-card overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Handover</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">
                        {project.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>{project.handover ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProject(project);
                              setProjectFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No projects yet. Add your first project.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="proj_id">Project ID *</Label>
                    <Input
                      id="proj_id"
                      name="id"
                      defaultValue={editingProject?.id ?? ""}
                      placeholder="e.g. VH, RH, T1"
                      required
                      disabled={!!editingProject}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proj_name">Name *</Label>
                    <Input
                      id="proj_name"
                      name="name"
                      defaultValue={editingProject?.name ?? ""}
                      placeholder="e.g. Verdana 8"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="proj_location">Location</Label>
                    <Input
                      id="proj_location"
                      name="location"
                      defaultValue={editingProject?.location ?? ""}
                      placeholder="e.g. Dubai Investment Park"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proj_type">Type</Label>
                    <Input
                      id="proj_type"
                      name="type"
                      defaultValue={editingProject?.type ?? ""}
                      placeholder="e.g. Apartments & Townhouses"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proj_handover">Handover</Label>
                    <Input
                      id="proj_handover"
                      name="handover"
                      defaultValue={editingProject?.handover ?? ""}
                      placeholder="e.g. Q4 2027"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setProjectFormOpen(false);
                        setEditingProject(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
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
