"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/user/components/app-shell";
import { ChatPanel } from "@/user/components/chat-panel";
import { useSocketChat } from "@/user/hooks/useSocketChat";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";

export default function ChatPage() {
  const router = useRouter();
  const { isHydrated, isReady } = useProtectedRoute({ requireUser: false });
  const { user, setUser, logout } = useAuthStore();
  const chatActions = useSocketChat();

  const loadProfile = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    loadProfile().catch(() => {
      logout();
      router.replace("/login");
    });
  }, [isReady, logout, router, setUser]);

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
        onJoinQueue={chatActions.joinQueue}
        onCancelQueue={chatActions.cancelQueue}
        onSendMessage={chatActions.sendMessage}
        onTyping={chatActions.sendTyping}
        onNextChat={chatActions.nextChat}
        onEndChat={chatActions.endChat}
        onBlockUser={blockUser}
        onReportUser={reportUser}
      />
    </AppShell>
  );
}

