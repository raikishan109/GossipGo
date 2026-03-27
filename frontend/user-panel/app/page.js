"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/user/components/app-shell";
import { HeroSection } from "@/user/components/hero-section";
import { useAuthStore } from "@/user/store/authStore";

export default function Home() {
  const router = useRouter();
  const { user, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/chat");
    }
  }, [isHydrated, router, token]);

  if (isHydrated && token) {
    return <main className="min-h-screen bg-surface" />;
  }

  return (
    <AppShell
      title="Anonymous chatting with anyone, anywhere. Features include live matches, history, and real-time moderation."
    >
      <HeroSection user={user} />
    </AppShell>
  );
}

