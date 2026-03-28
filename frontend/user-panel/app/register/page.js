"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/user/components/auth-form";
import { useAuthStore } from "@/user/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, guestLogin, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/chat");
    }
  }, [isHydrated, router, token]);

  const handleRegister = async (form) => {
    await register(form);
    router.replace("/chat");
  };

  const handleGuestContinue = async () => {
    await guestLogin();
    router.replace("/chat");
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface px-6 py-6 sm:p-6">
      <AuthForm type="register" onSubmit={handleRegister} onGuestContinue={handleGuestContinue} />
    </main>
  );
}

