"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/user/components/navbar";
import clsx from "clsx";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import {
  History,
  Home,
  MessageCircle,
  PencilLine,
  Search,
  Star,
  Users,
} from "lucide-react";

function getSidebarProfileLabel(user) {
  if (!user) {
    return "";
  }

  if (user.username) {
    return user.username;
  }

  if (user.email) {
    return user.email;
  }

  return "User";
}

function getSidebarInitials(user) {
  const source = getSidebarProfileLabel(user).trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function AppShell({ 
  children, 
  title, 
  compact = false, 
  sidebar = null, 
  sidebarOnMobileBottom = false 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_error) {
      // Local auth reset still signs the user out safely if the request fails.
    } finally {
      logout();
      router.replace("/login");
    }
  };

  const navigations = [
    ...(user ? [] : [{ label: "Home", href: "/", icon: Home }]),
    { label: "Chat", href: "/chat", icon: MessageCircle },
    { label: "Find Friends", href: "/friends/find", icon: Search },
    { label: "Friends List", href: "/friends/list", icon: Users },
    { label: "History", href: "/history", icon: History },
    { label: "Favorites", href: "/favorites", icon: Star },
  ];
  const shellWidthClass = compact ? "max-w-3xl" : "max-w-7xl";
  const desktopNavigation = user ? navigations.filter((item) => item.href !== "/") : [];

  return (
    <div className="flex min-h-screen flex-col px-3 pb-10 pt-3 sm:px-5 sm:pb-20 sm:pt-5 lg:px-6 lg:pb-24 lg:pt-6">
      <div className={clsx("mx-auto w-full", shellWidthClass)}>
        <Navbar 
          links={navigations}
          brandHref={user ? "/chat" : "/"}
          profile={{ user, onLogout: handleLogout }}
          actions={[
            { type: "theme" },
            ...(user
              ? [{ type: "button", label: "Logout", onClick: handleLogout, variant: "secondary" }]
              : [
                  { label: "Login", href: "/login", variant: "secondary" },
                  { label: "Join Now", href: "/register", variant: "primary" }
                ])
          ]}
        />
      </div>

      <main className={clsx(
        "relative mx-auto w-full flex-1",
        shellWidthClass,
        user && "lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8"
      )}>
        {user ? (
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-[2rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-glow backdrop-blur">
              <div className="relative mb-4 flex items-center gap-3 rounded-[1.2rem] border border-[rgb(var(--border))] bg-surface/60 px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getSidebarProfileLabel(user)}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getSidebarInitials(user)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {user.username || "Anonymous user"}
                  </p>
                  {user.status === "guest" ? (
                    <p className="truncate text-xs text-muted">Guest mode enabled</p>
                  ) : null}
                </div>
                <Link
                  href="/settings"
                  className="absolute right-4 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-[rgb(var(--border))] bg-card text-text transition hover:border-brand/20 hover:bg-surface"
                  aria-label="Open profile settings"
                  title="Edit profile settings"
                >
                  <PencilLine size={14} />
                </Link>
              </div>

              <nav className="grid gap-2">
                {desktopNavigation.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={`sidebar-${href}`}
                      href={href}
                      className={clsx(
                        "flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 transition-all",
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
                      <span className="text-sm font-semibold">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        ) : null}

        <div
          className={clsx(
            "w-full transition-all duration-300",
            sidebar && "grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start xl:gap-8"
          )}
        >
          <div>{children}</div>

          {sidebar ? (
            <aside className={clsx(
              "w-full self-start transition-all duration-300 xl:sticky xl:top-[6.5rem]",
              sidebarOnMobileBottom ? "order-last xl:order-none" : ""
            )}>
              {sidebar}
            </aside>
          ) : null}
        </div>
      </main>
    </div>
  );
}
