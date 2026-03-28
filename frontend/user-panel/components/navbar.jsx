"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, PencilLine, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { ThemeToggle } from "@/user/components/theme-toggle";

function NavbarAction({ action, mobile = false }) {
  if (action.type === "theme") {
    return <ThemeToggle compact={mobile} />;
  }

  if (action.type === "button") {
    return (
      <button
        type="button"
        onClick={action.onClick}
        className={clsx(
          "rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
          action.variant === "primary"
            ? "bg-brand text-white"
            : "border border-[rgb(var(--border))] text-text",
          mobile && "w-full justify-center px-3 py-2 text-[13px] sm:px-4 sm:text-sm"
        )}
      >
        {action.label}
      </button>
    );
  }

  return (
    <Link
      href={action.href}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
        action.variant === "primary"
          ? "bg-brand text-white"
          : "border border-[rgb(var(--border))] text-text",
        mobile && "block w-full px-3 py-2 text-center text-[13px] sm:px-4 sm:text-sm"
      )}
    >
      {action.label}
    </Link>
  );
}

function MenuToggleIcon({ open }) {
  return (
    <span className="relative block h-[18px] w-[22px] sm:h-5 sm:w-[22px]" aria-hidden="true">
      <span
        className={clsx(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-out",
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[2px]"
        )}
      />
      <span
        className={clsx(
          "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-all duration-200 ease-out",
          open && "scale-x-0 opacity-0"
        )}
      />
      <span
        className={clsx(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-out",
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-[2px]"
        )}
      />
    </span>
  );
}

function getProfileLabel(user) {
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

function getInitials(user) {
  const source = getProfileLabel(user).trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function getGenderLabel(user) {
  if (user?.gender === "male") {
    return "Male";
  }

  if (user?.gender === "female") {
    return "Female";
  }

  if (user?.gender === "other") {
    return "Other";
  }

  return "Prefer not to say";
}

function getPrivacyLabel(user) {
  return user?.preferences?.privacy === "strict" ? "Strict" : "Standard";
}

export function Navbar({ subtitle, links = [], actions = [], profile, brandHref = "/" }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [drawerTop, setDrawerTop] = useState(0);
  const [drawerLeft, setDrawerLeft] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(0);
  const [profileTop, setProfileTop] = useState(0);
  const [profileLeft, setProfileLeft] = useState(0);
  const [profileWidth, setProfileWidth] = useState(0);
  const headerRef = useRef(null);
  const profileRef = useRef(null);
  const profileButtonRef = useRef(null);
  const desktopActions = profile?.user ? actions.filter((action) => action.type === "theme") : actions;

  const syncDrawerPosition = () => {
    if (!headerRef.current) {
      return;
    }

    const rect = headerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 640;
    const horizontalInset = isMobile ? 12 : 16;
    const nextTop = rect.bottom + (isMobile ? 8 : 12);
    const nextLeft = isMobile ? horizontalInset : Math.max(rect.left, horizontalInset);
    const maxAvailableWidth = Math.max(viewportWidth - nextLeft - horizontalInset, 220);
    const baseWidth = isMobile
      ? Math.min(viewportWidth - horizontalInset * 2, 360)
      : Math.min(380, maxAvailableWidth);
    const minimumWidth = isMobile ? 180 : 220;
    const desiredWidth = Math.round(baseWidth * (isMobile ? 0.66 : 0.6));

    setDrawerTop(nextTop);
    setDrawerLeft(nextLeft);
    setDrawerWidth(Math.max(desiredWidth, minimumWidth));
  };

  const syncProfilePosition = () => {
    if (!profileButtonRef.current) {
      return;
    }

    const rect = profileButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 640;
    const horizontalInset = isMobile ? 12 : 16;
    const gap = isMobile ? 14 : 16;
    const desiredWidth = isMobile
      ? Math.min(viewportWidth - horizontalInset * 2, 260)
      : 272;
    const nextWidth = Math.min(
      Math.max(desiredWidth, 220),
      viewportWidth - horizontalInset * 2
    );
    const centeredLeft = rect.left + rect.width / 2 - nextWidth / 2;
    const nextLeft = Math.min(
      Math.max(centeredLeft, horizontalInset),
      viewportWidth - nextWidth - horizontalInset
    );

    setProfileTop(rect.bottom + gap);
    setProfileLeft(nextLeft);
    setProfileWidth(nextWidth);
  };

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen && !isProfileOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isProfileOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    syncDrawerPosition();

    window.addEventListener("resize", syncDrawerPosition);
    window.addEventListener("scroll", syncDrawerPosition, { passive: true });

    return () => {
      window.removeEventListener("resize", syncDrawerPosition);
      window.removeEventListener("scroll", syncDrawerPosition);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }

    syncProfilePosition();

    window.addEventListener("resize", syncProfilePosition);
    window.addEventListener("scroll", syncProfilePosition, { passive: true });

    return () => {
      window.removeEventListener("resize", syncProfilePosition);
      window.removeEventListener("scroll", syncProfilePosition);
    };
  }, [isProfileOpen]);

  return (
    <header
      ref={headerRef}
      className="relative z-30 mb-4 rounded-[1.2rem] border border-[rgb(var(--border))] bg-card/80 px-2.5 py-2.5 shadow-glow sm:mb-6 sm:rounded-[1.2rem] sm:px-4 sm:py-3"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                syncDrawerPosition();
                setIsProfileOpen(false);
              }
              setIsOpen((current) => !current);
            }}
            className="inline-flex items-center justify-center p-2.5 text-text sm:p-3 lg:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            <MenuToggleIcon open={isOpen} />
          </button>

          <div className="min-w-0 flex-1">
            <Link
              href={brandHref}
              className="inline-flex max-w-full items-center gap-2 text-text"
            >
              <span className="truncate font-display font-bold text-[1.4rem] leading-none sm:text-3xl">
                <span>Gossip</span>
                <span className="text-brand">Go</span>
              </span>
              <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-600 sm:px-2.5 sm:text-[10px]">
                Beta
              </span>
            </Link>
            {subtitle ? (
              <p className="mt-0.5 hidden truncate text-[10px] leading-tight text-muted min-[400px]:block sm:mt-1 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            {desktopActions.map((action) => (
              <NavbarAction
                key={`desktop-action-${action.type}-${action.label || action.href || "theme"}`}
                action={action}
              />
            ))}
          </div>

          {profile?.user ? (
          <div ref={profileRef} className="relative shrink-0">
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (!isProfileOpen) {
                  syncProfilePosition();
                }
                setIsProfileOpen((current) => !current);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface text-xs font-semibold text-text shadow-sm transition hover:-translate-y-0.5 sm:h-12 sm:w-12 sm:text-sm"
              aria-label="Open profile details"
              aria-expanded={isProfileOpen}
            >
              {profile.user.avatar ? (
                <img
                  src={profile.user.avatar}
                  alt={getProfileLabel(profile.user)}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(profile.user)}</span>
              )}
            </button>

            {isProfileOpen ? (
              <div
                className="fixed z-50 rounded-[0.95rem] border border-[rgb(var(--border))] bg-card p-3.5 shadow-2xl sm:rounded-[1rem] sm:p-4"
                style={{
                  left: `${profileLeft}px`,
                  top: `${profileTop}px`,
                  width: `${profileWidth}px`,
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-base font-semibold text-white sm:h-14 sm:w-14 sm:text-lg">
                    {profile.user.avatar ? (
                      <img
                        src={profile.user.avatar}
                        alt={getProfileLabel(profile.user)}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(profile.user)}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-text sm:text-lg">
                      {profile.user.username || "Anonymous user"}
                    </p>
                    <p className="truncate text-xs text-muted sm:text-sm">
                      {profile.user.email || "Guest mode enabled"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface/60 p-3 text-xs sm:mt-5 sm:rounded-[0.9rem] sm:p-4 sm:text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Role</span>
                    <span className="rounded-full bg-card px-3 py-1 font-semibold capitalize text-text">
                      {profile.user.role || "user"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Status</span>
                    <span className="rounded-full bg-card px-3 py-1 font-semibold capitalize text-text">
                      {profile.user.status || "active"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                  {profile.user.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-xs font-semibold text-text transition hover:-translate-y-0.5 sm:w-auto sm:text-sm"
                    >
                      <span>Admin panel</span>
                    </Link>
                  ) : null}
                  <Link
                    href="/settings"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-xs font-semibold text-text transition hover:-translate-y-0.5 sm:w-auto sm:text-sm"
                  >
                    <Settings size={16} />
                    <span>Profile settings</span>
                  </Link>
                  {profile.onLogout ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        profile.onLogout();
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-xs font-semibold text-text transition hover:-translate-y-0.5 sm:w-auto sm:text-sm"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div>
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-x-0 bottom-0 z-40 bg-black/30 backdrop-blur-sm"
            style={{ top: `${drawerTop}px` }}
          />

          <aside
            className="fixed z-50 flex min-w-0 flex-col overflow-y-auto rounded-[0.95rem] border border-[rgb(var(--border))] bg-card px-3.5 py-3.5 shadow-2xl md:rounded-[1.1rem] md:px-5 md:py-5"
            style={{
              left: `${drawerLeft}px`,
              top: `${drawerTop}px`,
              width: `${drawerWidth}px`,
              height: `calc(100dvh - ${drawerTop}px - 8px)`
            }}
          >
            {profile?.user ? (
              <div className="relative mb-3 flex items-start gap-3 rounded-[0.95rem] border border-[rgb(var(--border))] bg-surface/65 px-3.5 py-3 pr-12">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {profile.user.avatar ? (
                    <img
                      src={profile.user.avatar}
                      alt={getProfileLabel(profile.user)}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(profile.user)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5 pr-1">
                  <p className="break-words text-sm font-semibold leading-tight text-text">
                    {profile.user.username || "Anonymous user"}
                  </p>
                  <p className="break-words text-[11px] leading-4 text-muted">
                    {getGenderLabel(profile.user)}
                  </p>
                  <p className="break-words text-[11px] leading-4 text-muted">
                    {getPrivacyLabel(profile.user)}
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-[0.7rem] border border-[rgb(var(--border))] bg-card text-text transition hover:border-brand/20 hover:bg-surface"
                  aria-label="Open profile settings"
                  title="Edit profile settings"
                >
                  <PencilLine size={14} />
                </Link>
              </div>
            ) : null}

            <nav className="grid gap-1.5">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-3.5 rounded-[0.8rem] px-3.5 py-2.5 text-[14px] transition sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm",
                      active ? "bg-surface font-semibold text-text" : "text-muted hover:bg-surface"
                    )}
                  >
                    {Icon ? (
                      <span
                        className={clsx(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] border shadow-sm",
                          active
                            ? "border-brand/30 bg-brand text-white shadow-brand/15"
                            : "border-[rgb(var(--border))] bg-card text-text"
                        )}
                      >
                        <Icon size={18} />
                      </span>
                    ) : null}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto grid gap-2.5 border-t border-[rgb(var(--border))] pt-4 sm:gap-3 sm:pt-5">
              {actions.map((action) => (
                <NavbarAction
                  key={`mobile-${action.type}-${action.label || action.href || "theme"}`}
                  action={action}
                  mobile
                />
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
