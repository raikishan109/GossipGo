"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/user/components/app-shell";
import { Users, Loader2, MessageCircle } from "lucide-react";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { getUserId, getUserKey } from "@/user/utils/user";

function getInitials(username) {
  return String(username || "?").trim().charAt(0).toUpperCase();
}

function getPresenceLabel(user) {
  if (user?.status === "active") {
    return "Available now";
  }

  if (user?.lastSeenAt) {
    const lastSeen = new Date(user.lastSeenAt);
    if (!Number.isNaN(lastSeen.getTime())) {
      return `Seen ${lastSeen.toLocaleDateString()}`;
    }
  }

  return "Friend";
}

export default function FriendListPage() {
  const router = useRouter();
  const { isHydrated, isReady } = useProtectedRoute();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const [friendsRes, requestsRes] = await Promise.all([
        api.get("/social/friends"),
        api.get("/social/requests")
      ]);
      setFriends(friendsRes.data.friends);
      setRequests(requestsRes.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchSocialData();
    }
  }, [isReady]);

  const handleRequestAction = async (userId, type) => {
    try {
      if (type === "accept") {
        await api.post("/social/friends/request", { targetUserId: userId });
        await fetchSocialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell title="Friend Center">
      <div className="space-y-8 sm:space-y-10">
        {requests.filter(r => r.type === "received").length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4">
            <h2 className="mb-4 text-xl font-bold text-text">Pending Requests</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests
                .filter((request) => request.type === "received")
                .map((req, index) => (
                  <article key={getUserKey(req.user, "request", index)} className="flex flex-col items-start gap-4 rounded-2xl border border-[rgb(var(--border))] bg-card/60 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                      {req.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text">{req.user.username}</p>
                      <p className="text-xs text-muted">Sent you a request</p>
                    </div>
                    <button
                      onClick={() => handleRequestAction(getUserId(req.user), "accept")}
                      className="w-full rounded-xl bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white sm:w-auto"
                    >
                      Accept
                    </button>
                  </article>
                ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-text">
              <Users size={24} className="text-brand" />
              Friends ({friends.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[rgb(var(--border))] px-4 py-16 text-center sm:py-20">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted/30" />
              <p className="text-muted">You haven't added any friends yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend, index) => (
                <article
                  key={getUserKey(friend, "friend", index)}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-[rgb(var(--border))] bg-card/70 p-4 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.username}
                        className="h-12 w-12 rounded-2xl border border-[rgb(var(--border))] object-cover sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-base font-bold text-brand sm:h-14 sm:w-14 sm:text-lg">
                        {getInitials(friend.username)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-base font-semibold text-text sm:text-lg">
                          {friend.username}
                        </p>
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                          Friend
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{getPresenceLabel(friend)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="text-sm text-muted">Open a direct chat anytime.</p>
                    <button
                      type="button"
                      onClick={() => router.push(`/friends/chat/${getUserId(friend)}`)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
                    >
                      <MessageCircle size={16} />
                      <span>Chat Now</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
