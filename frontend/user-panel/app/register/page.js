"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/user/components/auth-form";
import { useAuthStore } from "@/user/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/chat");
    }
  }, [isHydrated, router, token]);

  const handleRegister = async (form) => {
    await register(form);
    router.replace("/chat");
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface p-4 sm:p-6">
      <AuthForm type="register" onSubmit={handleRegister} />
    </main>
  );
}

