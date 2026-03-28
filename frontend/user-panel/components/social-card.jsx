"use client";

import clsx from "clsx";
import { Heart, MessageCircle, Star, UserPlus } from "lucide-react";
import { getUserId } from "@/user/utils/user";

function getInitials(username) {
  return String(username || "?").trim().charAt(0).toUpperCase();
}

function getPresenceLabel(user, isFriend) {
  if (user?.status === "guest") {
    return "Guest account";
  }

  if (user?.status === "active") {
    return isFriend ? "Already in your circle" : "Available to connect";
  }

  if (user?.lastSeenAt) {
    const lastSeen = new Date(user.lastSeenAt);
    if (!Number.isNaN(lastSeen.getTime())) {
      return `Seen ${lastSeen.toLocaleDateString()}`;
    }
  }

  return "Community member";
}

export function SocialCard({
  user,
  isFriend = false,
  isFavorite = false,
  onFriendAction,
  onFavoriteAction,
  onChatAction,
}) {
  const userId = getUserId(user);
  const username = user?.username || "Unknown user";
  const avatar = user?.avatar || "";
  const presenceLabel = getPresenceLabel(user, isFriend);
  const canSendFriendRequest = typeof onFriendAction === "function" && !isFriend;
  const canToggleFavorite = typeof onFavoriteAction === "function";
  const canOpenChat = isFriend && typeof onChatAction === "function";

  return (
    <article className="group flex h-full flex-col gap-4 rounded-[1.5rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 sm:gap-5 sm:rounded-[2rem] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={username}
              className="h-12 w-12 rounded-2xl border border-[rgb(var(--border))] object-cover sm:h-14 sm:w-14"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-base font-bold text-brand sm:h-14 sm:w-14 sm:text-lg">
              {getInitials(username)}
            </div>
          )}

          <div className="min-w-0">
            <p className="break-words text-base font-semibold leading-6 text-text">{username}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{presenceLabel}</p>
          </div>
        </div>

        <span
          className={clsx(
            "self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] sm:shrink-0",
            isFavorite
              ? "bg-yellow-500/10 text-yellow-600"
              : isFriend
                ? "bg-brand/10 text-brand"
                : "bg-emerald-500/10 text-emerald-600"
          )}
        >
          {isFavorite ? "Favorite" : isFriend ? "Friend" : "Suggested"}
        </span>
      </div>

      <div className="rounded-2xl border border-[rgb(var(--border))] bg-surface/60 px-4 py-3 text-sm leading-6 text-muted">
        {isFavorite
          ? "Saved so you can find this person again quickly."
          : isFriend
            ? "This person is already part of your friend list. Open a direct chat anytime."
            : "Send a friend request to connect and chat again later."}
      </div>

      <div className="mt-auto grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {canOpenChat && (
          <button
            type="button"
            onClick={() => onChatAction(userId)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 sm:flex-1"
          >
            <MessageCircle size={16} />
            <span>Chat Now</span>
          </button>
        )}

        {canSendFriendRequest && (
          <button
            type="button"
            onClick={() => onFriendAction(userId)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 sm:flex-1"
          >
            <UserPlus size={16} />
            <span>Send Request</span>
          </button>
        )}

        {canToggleFavorite && (
          <button
            type="button"
            onClick={() => onFavoriteAction(userId)}
            className={clsx(
              "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition sm:w-auto",
              isFavorite
                ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
            )}
          >
            {isFavorite ? <Star size={16} fill="currentColor" /> : <Heart size={16} />}
            <span>{isFavorite ? "Remove" : "Favorite"}</span>
          </button>
        )}
      </div>
    </article>
  );
}
