"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

import { AppShell } from "@/user/components/app-shell";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";

export default function SettingsPage() {
  const router = useRouter();
  const { isHydrated, isReady } = useProtectedRoute();
  const { clearAuth } = useAuthStore();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== "DELETE") {
      setDeleteMessage("Type DELETE to confirm account removal.");
      return;
    }

    setDeleteMessage("");
    setIsDeletingAccount(true);

    try {
      await api.delete("/users/me");
      clearAuth();
      router.replace("/login");
    } catch (error) {
      setDeleteMessage(error?.response?.data?.message || "Could not delete your account.");
      setIsDeletingAccount(false);
    }
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell title="Account controls and safety settings.">
      <div className="grid gap-4 sm:gap-5">
        <div className="px-1">
          <h1 className="font-display text-[1.75rem] leading-tight text-text sm:text-4xl">Settings</h1>
        </div>

        <section className="rounded-[1rem] border border-red-500/20 bg-red-500/5 p-4 sm:rounded-[1.3rem] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <TriangleAlert size={18} />
            </span>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-text sm:text-lg">Delete account</h2>
              <p className="text-sm leading-6 text-muted">
                This permanently removes your profile, friend links, reports, chats, and active sessions.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:max-w-xl">
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Type DELETE to confirm</span>
              <input
                value={deleteConfirmation}
                disabled={isDeletingAccount}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                className="w-full rounded-[0.8rem] border border-red-500/25 bg-card px-4 py-2.5 text-sm text-text outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:py-3"
              />
            </label>

            {deleteMessage ? <p className="text-sm text-red-500">{deleteMessage}</p> : null}

            <button
              type="button"
              disabled={isDeletingAccount || deleteConfirmation.trim().toUpperCase() !== "DELETE"}
              onClick={handleDeleteAccount}
              className="w-full rounded-full border border-red-500/30 bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:py-3"
            >
              {isDeletingAccount ? "Deleting account..." : "Delete account"}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
