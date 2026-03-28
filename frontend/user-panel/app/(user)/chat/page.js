"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/user/components/app-shell";
import { ChatPanel } from "@/user/components/chat-panel";
import { useSocketChat } from "@/user/hooks/useSocketChat";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import { getUserId } from "@/user/utils/user";

export default function ChatPage() {
  const router = useRouter();
  const { isHydrated, isReady } = useProtectedRoute({ requireUser: false });
  const { user, setUser, logout } = useAuthStore();
  const chatActions = useSocketChat();
  const [friendshipState, setFriendshipState] = useState("idle");
  const [friendshipNote, setFriendshipNote] = useState("");
  const [friendshipNoteTone, setFriendshipNoteTone] = useState("brand");
  const [isFriendshipSubmitting, setIsFriendshipSubmitting] = useState(false);
  const partnerId = getUserId(chatActions.partner);

  const loadProfile = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
  };

  const syncFriendshipState = useCallback(async (targetUserId) => {
    if (!targetUserId) {
      return "idle";
    }

    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get("/social/friends"),
        api.get("/social/requests")
      ]);

      const friends = Array.isArray(friendsRes.data?.friends) ? friendsRes.data.friends : [];
      const requests = Array.isArray(requestsRes.data?.requests) ? requestsRes.data.requests : [];

      if (friends.some((friend) => getUserId(friend) === targetUserId)) {
        return "friends";
      }

      const matchingRequest = requests.find((request) => getUserId(request.user) === targetUserId);

      if (matchingRequest?.type === "sent") {
        return "sent";
      }

      if (matchingRequest?.type === "received") {
        return "received";
      }

      return "none";
    } catch (_error) {
      return "none";
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    loadProfile().catch(() => {
      logout();
      router.replace("/login");
    });
  }, [isReady, logout, router, setUser]);

  useEffect(() => {
    if (chatActions.status !== "chatting" || !partnerId) {
      setFriendshipState("idle");
      setFriendshipNote("");
      setFriendshipNoteTone("brand");
      setIsFriendshipSubmitting(false);
      return;
    }

    let isActive = true;

    setFriendshipNote("");
    setFriendshipNoteTone("brand");
    setFriendshipState("loading");

    syncFriendshipState(partnerId).then((nextState) => {
      if (isActive) {
        setFriendshipState(nextState);
      }
    });

    return () => {
      isActive = false;
    };
  }, [chatActions.status, partnerId, syncFriendshipState]);

  const blockUser = async (userId) => {
    if (!userId) {
      return;
    }

    await api.post(`/users/block/${userId}`);
    chatActions.endChat();
  };

  const reportUser = async (reportedUser) => {
    if (!reportedUser) {
      return;
    }

    const reason = window.prompt("Why are you reporting this user?", "Abusive language");
    if (!reason) {
      return;
    }

    await api.post("/reports", {
      reportedUser,
      chatId: chatActions.chatId,
      reason
    });
  };

  const addFriend = async (targetUserId) => {
    if (!targetUserId || isFriendshipSubmitting) {
      return;
    }

    setIsFriendshipSubmitting(true);
    setFriendshipNote("");
    setFriendshipNoteTone("brand");

    try {
      const { data } = await api.post("/social/friends/request", {
        targetUserId
      });
      const message = data?.message || "Friend request sent.";

      setFriendshipNote(message);
      setFriendshipNoteTone("brand");
      setFriendshipState(message === "Friend request accepted." ? "friends" : "sent");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to update your friend request right now.";

      setFriendshipNote(message);
      setFriendshipNoteTone("error");

      if (message === "Already friends.") {
        setFriendshipState("friends");
      } else if (message === "Request already sent.") {
        setFriendshipState("sent");
        setFriendshipNoteTone("brand");
      } else {
        setFriendshipState("none");
      }
    } finally {
      setIsFriendshipSubmitting(false);
    }
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-surface" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <AppShell
      title="Anonymous text-only chat with live matchmaking, controls, and history."
    >
      <ChatPanel
        user={user}
        messages={chatActions.messages}
        status={chatActions.status}
        partner={chatActions.partner}
        isPartnerTyping={chatActions.isPartnerTyping}
        queueMessage={chatActions.queueMessage}
        error={chatActions.error}
        endedReason={chatActions.endedReason}
        friendshipState={friendshipState}
        friendshipNote={friendshipNote}
        friendshipNoteTone={friendshipNoteTone}
        isFriendshipSubmitting={isFriendshipSubmitting}
        onJoinQueue={chatActions.joinQueue}
        onCancelQueue={chatActions.cancelQueue}
        onSendMessage={chatActions.sendMessage}
        onTyping={chatActions.sendTyping}
        onAddFriend={addFriend}
        onNextChat={chatActions.nextChat}
        onEndChat={chatActions.endChat}
        onBlockUser={blockUser}
        onReportUser={reportUser}
      />
    </AppShell>
  );
}

