"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Flag,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Shield,
  Users,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/admin/components/theme-toggle";
import api from "@/admin/services/api";
import { useAuthStore } from "@/admin/store/authStore";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: Shield },
  { href: "/admin/flagged", label: "Flagged Chats", icon: Flag },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const headerRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileSidebarTop, setMobileSidebarTop] = useState(0);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const syncMobileSidebarTop = () => {
    if (!headerRef.current) {
      return;
    }

    const { bottom } = headerRef.current.getBoundingClientRect();
    setMobileSidebarTop(Math.max(bottom, 0));
  };

  useEffect(() => {
    syncMobileSidebarTop();

    if (!isSidebarOpen) {
      return;
    }

    window.addEventListener("resize", syncMobileSidebarTop);
    window.addEventListener("scroll", syncMobileSidebarTop, { passive: true });

    return () => {
      window.removeEventListener("resize", syncMobileSidebarTop);
      window.removeEventListener("scroll", syncMobileSidebarTop);
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");
    } catch (_error) {
      // Clearing local auth still safely signs the admin out client-side.
    } finally {
      logout();
      router.replace("/admin/login");
      setIsLoggingOut(false);
    }
  };

  const renderNavigation = (mobile = false) => (
    <nav className={clsx("grid gap-2", mobile && "mt-4")}>
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={`${mobile ? "mobile" : "desktop"}-${href}`}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-[1.2rem] border px-3 py-3 transition-all sm:px-4",
              isActive
                ? "border-brand/30 bg-brand/10 text-text shadow-lg shadow-brand/5"
                : "border-[rgb(var(--border))] bg-surface/55 text-muted hover:border-brand/20 hover:bg-surface"
            )}
          >
            <span
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-2xl",
                isActive ? "bg-brand text-white" : "bg-card text-text"
              )}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {href === "/admin" ? "Summary" : "Manage"}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  const renderThemeSection = (mobile = false) => (
    <div
      className={clsx(
        "mt-6 rounded-[1.4rem] border border-[rgb(var(--border))] bg-surface/55 p-4",
        mobile && "mt-auto"
      )}
    >
      <div className="flex items-center justify-start">
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
        <header
          ref={headerRef}
          className="rounded-[1.7rem] border border-[rgb(var(--border))] bg-card/80 p-3.5 shadow-glow backdrop-blur sm:rounded-[2rem] sm:p-5"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    syncMobileSidebarTop();
                    setIsSidebarOpen((current) => !current);
                  }}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-surface/70 text-text transition hover:border-brand/30 lg:hidden"
                  aria-label={isSidebarOpen ? "Close admin navigation" : "Open admin navigation"}
                  aria-expanded={isSidebarOpen}
                >
                  {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 min-w-0 items-center text-text transition hover:text-brand"
                >
                  <span className="truncate font-display text-xl leading-none sm:text-2xl">
                    Gossip<span className="text-brand">Go</span>
                  </span>
                </Link>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-brand/30 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4"
                >
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {isSidebarOpen ? (
          <div className="lg:hidden">
            <button
              type="button"
              aria-label="Close admin menu overlay"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-x-0 bottom-0 z-40 bg-black/35 backdrop-blur-sm"
              style={{ top: mobileSidebarTop }}
            />
            <aside
              className="fixed bottom-3 left-3 z-50 flex w-[min(calc(100vw-1.5rem),21rem)] flex-col overflow-y-auto rounded-[1.75rem] border border-[rgb(var(--border))] bg-card px-4 py-4 shadow-2xl sm:bottom-4 sm:left-6 sm:rounded-[2rem] sm:py-5"
              style={{ top: mobileSidebarTop + 12 }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Navigation
                </p>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-surface/70 text-text"
                  aria-label="Close admin menu"
                >
                  <X size={18} />
                </button>
              </div>
              {renderNavigation(true)}
              {renderThemeSection(true)}
            </aside>
          </div>
        ) : null}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-[2rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-glow backdrop-blur">
              {renderNavigation()}
              {renderThemeSection()}
            </div>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
