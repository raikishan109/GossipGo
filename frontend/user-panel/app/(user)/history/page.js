"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/user/components/app-shell";
import { History, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import { getUserId, getUserKey } from "@/user/utils/user";

export default function HistoryPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const { user: currentUser } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/social/history");
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchHistory();
    }
  }, [isReady]);

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell title="Chat History">
      <div className="w-full space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] pb-5 sm:gap-4 sm:pb-6">
          <History size={32} className="shrink-0 text-brand" />
          <h2 className="text-2xl font-bold text-text">Matching History</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[rgb(var(--border))] px-4 py-16 text-center sm:py-20">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted/30" />
            <p className="text-muted">You haven't participated in any chats yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((chat) => {
              const partners = chat.users.filter((u) => getUserId(u) !== getUserId(currentUser));

              return (
                <article key={chat._id} className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card/60 p-4 transition-all hover:border-brand/40 sm:p-5">
                  <div className="absolute right-0 top-0 h-1 bg-brand/20 w-0 group-hover:w-full transition-all duration-500" />
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex -space-x-2 overflow-hidden sm:-space-x-3">
                        {partners.map((u, index) => (
                          <div key={`${chat._id}-${getUserKey(u, "partner", index)}`} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-brand/10 text-xs font-bold text-brand">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.username} className="h-full w-full object-cover" />
                            ) : (
                              <span>{u.username.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-text">
                          {partners.map(u => u.username).join(", ") || "Unknown Partner"}
                        </p>
                        <p className="text-xs text-muted">
                          Started {chat.startedAt ? formatDistanceToNow(new Date(chat.startedAt), { addSuffix: true }) : 'unknown'}
                        </p>
                      </div>
                    </div>

                  <div className="grid w-full grid-cols-2 gap-4 self-end sm:flex sm:w-auto sm:items-center sm:gap-6 sm:self-auto">
                    <div className="flex flex-col items-start sm:items-end">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">Messages</p>
                      <p className="text-xl font-display text-text">{chat.messages.length}</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Reason</p>
                        <p className="break-words text-xs text-brand">{chat.endedReason || "User left"}</p>
                    </div>
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
