"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/user/components/app-shell";
import { SocialCard } from "@/user/components/social-card";
import { Users, Loader2 } from "lucide-react";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { getUserId, getUserKey } from "@/user/utils/user";

export default function FriendListPage() {
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {friends.map((friend, index) => (
                <SocialCard
                  key={getUserKey(friend, "friend", index)}
                  user={friend}
                  isFriend
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
