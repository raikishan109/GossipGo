"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Activity,
  AlertTriangle,
  Clock3,
  FileWarning,
  Flag,
  Loader2,
  MessageSquareWarning,
  ShieldCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import api from "@/admin/services/api";

const USER_STATUS_OPTIONS = ["active", "banned", "guest"];
const REPORT_STATUS_OPTIONS = ["open", "reviewed", "resolved", "dismissed"];

function getRecordId(record) {
  return record?.id || record?._id || "";
}

function formatDate(value) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatCard({ icon: Icon, label, value, tone = "brand" }) {
  const toneStyles = {
    brand: "bg-brand/10 text-brand",
    accent: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  };

  return (
    <article className="rounded-[1.5rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-sm sm:rounded-[1.7rem] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
          <p className="mt-3 text-2xl font-bold text-text sm:text-3xl">{value}</p>
        </div>
        <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12", toneStyles[tone])}>
          <Icon size={22} />
        </span>
      </div>
    </article>
  );
}

function Panel({ title, description, children, actions = null }) {
  return (
    <section className="rounded-[1.6rem] border border-[rgb(var(--border))] bg-card/85 p-4 shadow-sm sm:rounded-[1.8rem] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text sm:text-xl">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[rgb(var(--border))] px-4 py-10 text-center sm:px-6 sm:py-14">
      <Icon className="mx-auto h-10 w-10 text-muted/40" />
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

export function AdminDashboard({ section = "overview" }) {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [flaggedChats, setFlaggedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingKey, setPendingKey] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSection() {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const requests = [api.get("/admin/dashboard")];

        if (section === "users") {
          requests.push(api.get("/admin/users"));
        } else if (section === "reports") {
          requests.push(api.get("/admin/reports"));
        } else if (section === "flagged") {
          requests.push(api.get("/admin/chats/flagged"));
        }

        const responses = await Promise.all(requests);
        if (ignore) {
          return;
        }

        setMetrics(responses[0].data.metrics);

        if (section === "users") {
          setUsers(responses[1].data.users || []);
          setReports([]);
          setFlaggedChats([]);
          return;
        }

        if (section === "reports") {
          setReports(responses[1].data.reports || []);
          setUsers([]);
          setFlaggedChats([]);
          return;
        }

        if (section === "flagged") {
          setFlaggedChats(responses[1].data.chats || []);
          setUsers([]);
          setReports([]);
          return;
        }

        setUsers([]);
        setReports([]);
        setFlaggedChats([]);
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setError(requestError.response?.data?.message || "Admin data could not be loaded.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSection();

    return () => {
      ignore = true;
    };
  }, [section]);

  const updateUserStatus = async (userId, status) => {
    const actionKey = `user:${userId}:${status}`;

    try {
      setPendingKey(actionKey);
      setNotice("");
      const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
      const updatedUserId = getRecordId(data.user);

      setUsers((current) =>
        current.map((user) => (getRecordId(user) === updatedUserId ? { ...user, ...data.user } : user))
      );
      setNotice(data.message || "User status updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "User status could not be updated.");
    } finally {
      setPendingKey("");
    }
  };

  const updateReportStatus = async (reportId, status) => {
    const actionKey = `report:${reportId}:${status}`;

    try {
      setPendingKey(actionKey);
      setNotice("");
      const { data } = await api.patch(`/admin/reports/${reportId}`, {
        status,
        resolutionNotes: "",
      });
      const updatedReportId = getRecordId(data.report);

      setReports((current) =>
        current.map((report) => (getRecordId(report) === updatedReportId ? { ...report, ...data.report } : report))
      );
      setNotice(data.message || "Report updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Report could not be updated.");
    } finally {
      setPendingKey("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30rem] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Panel title="Admin dashboard" description="We hit a problem while loading control room data.">
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>
      ) : null}

      {section === "overview" ? (
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          <StatCard icon={Users} label="Total users" value={metrics?.totalUsers || 0} tone="brand" />
          <StatCard icon={UserRoundX} label="Guest users" value={metrics?.guestUsers || 0} tone="accent" />
          <StatCard icon={Activity} label="Active chats" value={metrics?.activeChats || 0} tone="brand" />
          <StatCard icon={Clock3} label="Waiting users" value={metrics?.waitingUsers || 0} tone="warning" />
          <StatCard icon={ShieldCheck} label="Open reports" value={metrics?.openReports || 0} tone="danger" />
          <StatCard icon={MessageSquareWarning} label="Flagged chats" value={metrics?.flaggedChats || 0} tone="warning" />
        </section>
      ) : null}

      {section === "users" ? (
        <Panel title="User moderation" description="Review recent accounts and update account status in one click.">
          {users.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="User records will appear here once they exist." />
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <article key={getRecordId(user)} className="rounded-[1.4rem] border border-[rgb(var(--border))] bg-surface/55 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-lg font-semibold text-text">{user.username || "Unnamed user"}</p>
                      <p className="break-all text-sm text-muted">{user.email || "No email attached"}</p>
                      <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.16em] text-muted sm:grid-cols-2">
                        <span>Role: {user.role || "user"}</span>
                        <span>Status: {user.status || "active"}</span>
                        <span>Joined: {formatDate(user.createdAt)}</span>
                        <span>Seen: {formatDate(user.lastSeenAt)}</span>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {USER_STATUS_OPTIONS.map((status) => {
                        const isPending = pendingKey === `user:${getRecordId(user)}:${status}`;
                        const isActive = (user.status || "active") === status;

                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={isPending || isActive}
                            onClick={() => updateUserStatus(getRecordId(user), status)}
                            className={clsx(
                              "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition sm:w-auto",
                              isActive
                                ? "bg-brand text-white"
                                : "border border-[rgb(var(--border))] bg-card text-text hover:border-brand/30",
                              (isPending || isActive) && "cursor-not-allowed opacity-80"
                            )}
                          >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {section === "reports" ? (
        <Panel title="Report queue" description="Triage reports, move them through moderation stages, and keep audit status fresh.">
          {reports.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No reports in queue"
              description="Once users submit reports, they'll appear here for review."
            />
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <article key={getRecordId(report)} className="rounded-[1.4rem] border border-[rgb(var(--border))] bg-surface/55 p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-semibold text-text">
                          {report.reportedUser?.username || "Unknown user"} reported by{" "}
                          {report.reporterUser?.username || "Unknown user"}
                        </p>
                        <p className="mt-1 break-words text-sm text-muted">
                          {report.reason || "No reason provided."}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                        {report.status || "open"}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                      <p className="break-all">Chat: {report.chat?.roomId || "Not linked"}</p>
                      <p>Created: {formatDate(report.createdAt)}</p>
                      <p className="break-all">Reported user email: {report.reportedUser?.email || "Unavailable"}</p>
                      <p className="break-all">Reporter email: {report.reporterUser?.email || "Unavailable"}</p>
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {REPORT_STATUS_OPTIONS.map((status) => {
                        const isPending = pendingKey === `report:${getRecordId(report)}:${status}`;
                        const isActive = (report.status || "open") === status;

                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={isPending || isActive}
                            onClick={() => updateReportStatus(getRecordId(report), status)}
                            className={clsx(
                              "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition sm:w-auto",
                              isActive
                                ? "bg-brand text-white"
                                : "border border-[rgb(var(--border))] bg-card text-text hover:border-brand/30",
                              (isPending || isActive) && "cursor-not-allowed opacity-80"
                            )}
                          >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {section === "flagged" ? (
        <Panel title="Flagged chats" description="Inspect chats that moderation marked for suspicious or abusive content.">
          {flaggedChats.length === 0 ? (
            <EmptyState
              icon={FileWarning}
              title="No flagged chats found"
              description="Moderation hits will surface here once they happen."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {flaggedChats.map((chat) => (
                <article key={getRecordId(chat)} className="rounded-[1.4rem] border border-[rgb(var(--border))] bg-surface/55 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all text-lg font-semibold text-text">{chat.roomId || "Unnamed room"}</p>
                      <p className="mt-1 break-words text-sm text-muted">
                        {(chat.users || []).map((user) => `${user.username || "Anonymous"} (${user.status || "unknown"})`).join(" | ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                      {chat.moderation?.flagCount || 0} flags
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-muted">
                    <p>Started: {formatDate(chat.startedAt || chat.createdAt)}</p>
                    <p>Updated: {formatDate(chat.updatedAt)}</p>
                    <p>Status: {chat.status || "active"}</p>
                    <p>Messages: {chat.messages?.length || 0}</p>
                    <p className="break-words">
                      Flagged words: {(chat.moderation?.flaggedWords || []).join(", ") || "None captured"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}
    </div>
  );
}
