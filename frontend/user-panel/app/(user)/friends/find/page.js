"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { AppShell } from "@/user/components/app-shell";
import { SocialCard } from "@/user/components/social-card";
import { Search, Loader2 } from "lucide-react";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { getUserId, getUserKey } from "@/user/utils/user";

export default function FindFriendsPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const [users, setUsers] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/social/favorites");
      const ids = Array.isArray(res.data?.favorites)
        ? res.data.favorites.map((user) => getUserId(user)).filter(Boolean)
        : [];
      setFavoriteIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async (searchTerm = "", signal) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/social/find", {
        params: searchTerm ? { search: searchTerm } : {},
        signal
      });
      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (err) {
      if (err.code === "ERR_CANCELED") {
        return;
      }
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }

    const controller = new AbortController();
    const normalizedSearch = deferredSearch.trim();

    if (!normalizedSearch) {
      setUsers([]);
      setError("");
      setLoading(false);
      return () => {
        controller.abort();
      };
    }

    const timeoutId = setTimeout(() => {
      fetchUsers(normalizedSearch, controller.signal);
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [deferredSearch, isReady]);

  useEffect(() => {
    if (isReady) {
      fetchFavorites();
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

  const handleFavoriteToggle = async (userId) => {
    try {
      await api.post("/social/favorites", { targetUserId: userId });
      setFavoriteIds((current) =>
        current.includes(userId)
          ? current.filter((id) => id !== userId)
          : [...current, userId]
      );
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

        {!search.trim() ? (
          <p className="py-16 text-center text-muted sm:py-20">Start typing to search users.</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-16 text-center text-muted sm:py-20">No users match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((user, index) => (
              <SocialCard
                key={getUserKey(user, "discover", index)}
                user={user}
                isFavorite={favoriteIds.includes(getUserId(user))}
                onFriendAction={() => handleFriendRequest(getUserId(user))}
                onFavoriteAction={() => handleFavoriteToggle(getUserId(user))}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
