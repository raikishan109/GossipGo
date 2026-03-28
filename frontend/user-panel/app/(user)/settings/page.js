"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/user/components/app-shell";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import { useUiStore } from "@/user/store/uiStore";

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

export default function SettingsPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const [form, setForm] = useState({
    username: "",
    avatar: "",
    theme: "light",
    privacy: "standard",
    chatHistoryEnabled: false
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }

    setForm({
      username: user.username || "",
      avatar: user.avatar || "",
      theme: normalizeTheme(user.preferences?.theme || theme),
      privacy: user.preferences?.privacy || "standard",
      chatHistoryEnabled: Boolean(user.preferences?.chatHistoryEnabled)
    });
  }, [isReady, theme, user]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setMessage("");

    const [profileResponse, settingsResponse] = await Promise.all([
      api.patch("/users/me", {
        username: form.username,
        avatar: form.avatar
      }),
      api.patch("/users/settings", {
        theme: form.theme,
        privacy: form.privacy,
        chatHistoryEnabled: form.chatHistoryEnabled
      })
    ]);

    setUser(settingsResponse.data.user);
    setTheme(form.theme);
    setMessage(profileResponse.data.message);
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell
      title="Profile, privacy, theme, and chat retention controls."
      sidebarOnMobileBottom
      sidebar={
        <section className="rounded-[1rem] border border-[rgb(var(--border))] bg-card/80 p-4 sm:rounded-[1.3rem] sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand sm:text-xs sm:tracking-[0.28em]">
            Privacy guide
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-muted sm:mt-4 sm:space-y-3 sm:leading-7">
            <li>Keep chat history off for maximum anonymity.</li>
            <li>Use guest mode when you do not want an email-linked account.</li>
            <li>Block and report users directly from the chat window.</li>
          </ul>
        </section>
      }
    >
      <section className="rounded-[1rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-glow sm:rounded-[1.3rem] sm:p-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-[1.75rem] leading-tight text-text sm:text-4xl">Settings</h1>
          <p className="text-sm leading-6 text-muted">
            Update your profile, privacy, and theme preferences.
          </p>
        </div>

        <form className="mt-5 grid gap-4 sm:mt-6 sm:gap-5" onSubmit={saveSettings}>
          <label className="block">
            <span className="mb-2 block text-[13px] text-muted sm:text-sm">Username</span>
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-muted sm:text-sm">Avatar URL</span>
            <input
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
              className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
              placeholder="https://example.com/avatar.png"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-muted sm:text-sm">Theme</span>
            <select
              value={form.theme}
              onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
              className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-muted sm:text-sm">Privacy mode</span>
            <select
              value={form.privacy}
              onChange={(event) => setForm((current) => ({ ...current, privacy: event.target.value }))}
              className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
            >
              <option value="standard">Standard</option>
              <option value="strict">Strict</option>
            </select>
          </label>
          <label className="flex items-start gap-3 rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-3 sm:items-center sm:rounded-2xl sm:py-4">
            <input
              className="mt-0.5 sm:mt-0"
              type="checkbox"
              checked={form.chatHistoryEnabled}
              onChange={(event) =>
                setForm((current) => ({ ...current, chatHistoryEnabled: event.target.checked }))
              }
            />
            <span className="text-sm leading-6 text-text sm:leading-normal">
              Enable chat history for your own account
            </span>
          </label>

          {message ? <p className="text-sm text-accent">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white sm:w-fit sm:py-3"
          >
            Save settings
          </button>
        </form>
      </section>
    </AppShell>
  );
}

