"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/user/components/app-shell";
import { SocialCard } from "@/user/components/social-card";
import { Search, Loader2 } from "lucide-react";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { getUserId, getUserKey } from "@/user/utils/user";

export default function FindFriendsPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/social/find");
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchUsers();
    }
  }, [isReady]);

  const handleFriendRequest = async (userId) => {
    try {
      await api.post("/social/friends/request", { targetUserId: userId });
      setUsers((current) => current.filter((user) => getUserId(user) !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) => 
    String(user?.username || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell title="Find New Friends">
      <div className="space-y-5 sm:space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[rgb(var(--border))] bg-surface/50 py-3.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand sm:py-4 sm:pr-6"
          />
        </div>

        {error ? (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="py-16 text-center text-muted sm:py-20">No users found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user, index) => (
              <SocialCard
                key={getUserKey(user, "discover", index)}
                user={user}
                onFriendAction={() => handleFriendRequest(getUserId(user))}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
