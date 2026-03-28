"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/user/components/auth-form";
import { useAuthStore } from "@/user/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, guestLogin, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/chat");
    }
  }, [isHydrated, router, token]);

  const handleLogin = async (credentials) => {
    await login(credentials);
    router.replace("/chat");
  };

  const handleGuestContinue = async () => {
    await guestLogin();
    router.replace("/chat");
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-4 sm:p-6">
      <AuthForm type="login" onSubmit={handleLogin} onGuestContinue={handleGuestContinue} />
    </main>
  );
}

