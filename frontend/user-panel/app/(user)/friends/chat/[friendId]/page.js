"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, Loader2, MessageCircle, Send } from "lucide-react";

import { AppShell } from "@/user/components/app-shell";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import { getUserId } from "@/user/utils/user";

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

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getFriendFromChat(chat, currentUserId) {
  return chat?.users?.find((user) => getUserId(user) !== currentUserId) || null;
}

function getMessageSenderId(message) {
  return getUserId(message?.sender) || message?.sender?.toString?.() || "";
}

export default function FriendChatPage() {
  const params = useParams();
  const friendId = Array.isArray(params?.friendId) ? params.friendId[0] : params?.friendId;
  const { isHydrated, isReady } = useProtectedRoute();
  const { user: currentUser } = useAuthStore();
  const currentUserId = getUserId(currentUser);
  const scrollRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [friend, setFriend] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const syncConversation = (nextChat, fallbackFriend = null) => {
    setChat(nextChat);
    setFriend(fallbackFriend || getFriendFromChat(nextChat, currentUserId));
  };

  const fetchConversation = async ({ silent = false } = {}) => {
    if (!friendId) {
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }

      const { data } = await api.get(`/chats/direct/${friendId}`);
      syncConversation(data.chat, data.friend);
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load this conversation.";
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isReady && friendId) {
      fetchConversation();
    }
  }, [friendId, isReady]);

  useEffect(() => {
    if (!isReady || !friendId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchConversation({ silent: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [friendId, isReady]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages?.length]);

  const handleSend = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || !friendId) {
      return;
    }

    try {
      setSending(true);
      const { data } = await api.post(`/chats/direct/${friendId}/messages`, {
        content: trimmed
      });
      syncConversation(data.chat, data.friend);
      setInput("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell title={friend ? `Chat with ${friend.username}` : "Friend Chat"}>
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/friends/list"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-text"
        >
          <ArrowLeft size={16} />
          <span>Back to friends</span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : error && !chat ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-4 py-16 text-center sm:py-20">
            <p className="text-sm font-semibold text-red-500">{error}</p>
          </div>
        ) : (
          <div className="flex h-[calc(100dvh-8rem)] min-h-[34rem] max-h-[48rem] flex-col overflow-hidden rounded-[1.8rem] border border-[rgb(var(--border))] bg-card/80 shadow-2xl backdrop-blur-xl sm:h-[48rem] sm:rounded-[2.5rem]">
            <header className="flex shrink-0 items-center gap-4 border-b border-[rgb(var(--border))] bg-surface/50 px-4 py-4 sm:px-8 sm:py-5">
              {friend?.avatar ? (
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="h-12 w-12 rounded-2xl border border-[rgb(var(--border))] object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-lg font-bold text-brand">
                  {getInitials(friend?.username)}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-text sm:text-xl">
                  {friend?.username || "Friend"}
                </h2>
                <p className="text-sm text-muted">{getPresenceLabel(friend)}</p>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand/20 hover:[&::-webkit-scrollbar-thumb]:bg-brand/40"
            >
              {chat?.messages?.length ? (
                chat.messages.map((message, index) => {
                  const isCurrentUser = getMessageSenderId(message) === currentUserId;

                  return (
                    <div
                      key={`${message.createdAt || "message"}-${index}`}
                      className={clsx(
                        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={clsx(
                          "max-w-[85%] rounded-3xl px-4 py-3 text-sm sm:max-w-[65%] sm:px-6 sm:py-3.5 sm:text-base",
                          isCurrentUser
                            ? "rounded-tr-none bg-brand text-white shadow-lg shadow-brand/10"
                            : "rounded-tl-none border border-[rgb(var(--border))] bg-surface text-text"
                        )}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={clsx(
                            "mt-2 text-[11px]",
                            isCurrentUser ? "text-white/75" : "text-muted"
                          )}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <MessageCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-text">Start your conversation</h3>
                    <p className="max-w-md text-sm text-muted sm:text-base">
                      Send your first message to {friend?.username || "your friend"} from here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-[rgb(var(--border))] bg-surface/30 p-4 sm:p-8">
              {error && chat ? (
                <p className="mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
                  {error}
                </p>
              ) : null}

              <form
                onSubmit={handleSend}
                className="flex items-center gap-3 rounded-[1.25rem] border border-[rgb(var(--border))] bg-card px-3 py-2 focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/5 sm:gap-4 sm:rounded-[2rem] sm:px-6 sm:py-3"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={`Message ${friend?.username || "your friend"}...`}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-text outline-none sm:text-base"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12",
                    input.trim() && !sending
                      ? "scale-105 bg-brand text-white shadow-glow shadow-brand/20"
                      : "bg-muted/10 text-muted grayscale"
                  )}
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
                  )}
                </button>
              </form>
            </footer>
          </div>
        )}
      </div>
    </AppShell>
  );
}
