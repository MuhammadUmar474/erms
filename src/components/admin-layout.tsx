"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import TopBar from "@/components/top-bar";
import { verifyAdminPassword } from "@/app/admin/actions";

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("erms_admin_auth") === "true";
    }
    return false;
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

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

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("erms_admin_auth");
  };

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
                  <p className="text-[11px] text-red-500 mt-1">Incorrect password.</p>
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 p-4">{children}</main>
        <footer className="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>&copy; 2026 Reportage Properties. All rights reserved.</span>
          <span>Admin Panel</span>
        </footer>
      </div>
    </div>
  );
}
