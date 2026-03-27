"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/user/store/authStore";

export function useProtectedRoute(options = {}) {
  const router = useRouter();
  const {
    requireAdmin = false,
    requireUser = true,
    redirectTo = requireAdmin ? "/admin/login" : "/login",
  } = options;
  const { user, token, isHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      setIsReady(false);
      router.replace(redirectTo);
      return;
    }

    if (requireUser && !user) {
      setIsReady(false);
      router.replace(redirectTo);
      return;
    }

    if (requireAdmin && user.role !== "admin") {
      setIsReady(false);
      router.replace(redirectTo);
      return;
    }

    setIsReady(true);
  }, [isHydrated, redirectTo, requireAdmin, requireUser, router, token, user]);

  return { isHydrated, isReady };
}
