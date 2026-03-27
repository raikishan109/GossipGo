import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/user/services/api";

const TOKEN_STORAGE_KEY = "token";
const CSRF_STORAGE_KEY = "csrfToken";

function syncAuthStorage({ token = null, csrfToken = null }) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (csrfToken) {
    localStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
  } else {
    localStorage.removeItem(CSRF_STORAGE_KEY);
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      csrfToken: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        syncAuthStorage({
          token,
          csrfToken: useAuthStore.getState().csrfToken,
        });
        set({ token });
      },
      setCsrfToken: (csrfToken) => {
        syncAuthStorage({
          token: useAuthStore.getState().token,
          csrfToken,
        });
        set({ csrfToken });
      },
      clearAuth: () => {
        syncAuthStorage({});
        set({ user: null, token: null, csrfToken: null });
      },
      login: async (credentials) => {
        const { data } = await api.post("/auth/login", credentials);
        syncAuthStorage({ token: data.token, csrfToken: data.csrfToken });
        set({ user: data.user, token: data.token, csrfToken: data.csrfToken });
      },
      register: async (form) => {
        const { data } = await api.post("/auth/register", form);
        syncAuthStorage({ token: data.token, csrfToken: data.csrfToken });
        set({ user: data.user, token: data.token, csrfToken: data.csrfToken });
      },
      logout: () => get().clearAuth(),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: (state) => {
        return (persistedState) => {
          if (!persistedState?.token) {
            state.clearAuth();
            state.setHydrated();
            return;
          }

          syncAuthStorage({
            token: persistedState?.token || null,
            csrfToken: persistedState?.csrfToken || null,
          });
          state.setHydrated();
        };
      },
    }
  )
);
