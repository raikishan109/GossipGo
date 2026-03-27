import axios from "axios";

function normalizeApiUrl(url) {
  const trimmedUrl = String(url || "").trim().replace(/\/+$/, "");

  if (!trimmedUrl) {
    return "http://localhost:5000/api";
  }

  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
}

const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
const AUTH_STORAGE_KEY = "auth-storage";

function getStoredAuthValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const directValue = localStorage.getItem(key);
  if (directValue) {
    return directValue;
  }

  try {
    const persisted = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
    return persisted?.state?.[key] || null;
  } catch (_error) {
    return null;
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredAuthValue("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = String(config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const csrfToken = getStoredAuthValue("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return config;
});

export default api;
