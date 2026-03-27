"use client";

import { AdminShell } from "@/admin/components/admin-shell";
import { AdminDashboard } from "@/admin/components/admin-dashboard";
import { useProtectedRoute } from "@/admin/hooks/useProtectedRoute";

export default function AdminPage({ section = "overview" }) {
  const { isHydrated, isReady } = useProtectedRoute({
    requireAdmin: true,
    redirectTo: "/admin/login",
  });

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AdminShell>
      <AdminDashboard section={section} />
    </AdminShell>
  );
}
