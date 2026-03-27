"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/user/components/app-shell";
import { SocialCard } from "@/user/components/social-card";
import { Star, Loader2 } from "lucide-react";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { getUserId, getUserKey } from "@/user/utils/user";

export default function FavoritesPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/social/favorites");
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchFavorites();
    }
  }, [isReady]);

  const toggleFavorite = async (userId) => {
    try {
      await api.post("/social/favorites", { targetUserId: userId });
      setFavorites((current) => current.filter((user) => getUserId(user) !== userId));
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
    <AppShell title="Favorite Users">
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] pb-5 sm:gap-4 sm:pb-6">
          <Star size={32} fill="currentColor" className="shrink-0 text-yellow-500" />
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-text">Your Favorites</h2>
            <p className="text-sm text-muted">People you've saved for quick access.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[rgb(var(--border))] px-4 py-16 text-center sm:py-20">
            <Star className="mx-auto mb-4 h-12 w-12 text-muted/30" />
            <p className="text-muted">You haven't favorited anyone yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((user, index) => (
              <SocialCard
                key={getUserKey(user, "favorite", index)}
                user={user}
                isFavorite
                onFavoriteAction={() => toggleFavorite(getUserId(user))}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
