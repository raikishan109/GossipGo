"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/admin/components/auth-form";
import { useAuthStore } from "@/admin/store/authStore";

function createClientError(message) {
  const error = new Error(message);
  error.response = { data: { message } };
  return error;
}

export function AdminLoginForm({ nextPath = "/admin" }) {
  const router = useRouter();
  const { login, logout, user, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token && user?.role === "admin") {
      router.replace(nextPath);
    }
  }, [isHydrated, nextPath, router, token, user]);

  const handleAdminLogin = async (credentials) => {
    await login(credentials);

    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role !== "admin") {
      logout();
      throw createClientError("This account does not have admin access.");
    }

    router.replace(nextPath);
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleAdminLogin}
      eyebrow="Admin access"
      title="Sign in to control room"
      description="Use an administrator account to review reports, users, and flagged chats."
      submitLabel="Access Admin Panel"
      hideSwitch
      brandHref="/admin"
      footerNote="Restricted area for authorized moderators and administrators."
    />
  );
}
