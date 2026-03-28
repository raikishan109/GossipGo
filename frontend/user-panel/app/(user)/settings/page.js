"use client";

import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/user/components/app-shell";
import { useProtectedRoute } from "@/user/hooks/useProtectedRoute";
import api from "@/user/services/api";
import { useAuthStore } from "@/user/store/authStore";
import { useUiStore } from "@/user/store/uiStore";
import { avatarPresetGroups } from "@/user/utils/avatar-presets";

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const MAX_AVATAR_DATA_LENGTH = 350000;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not process that image."));
    image.src = src;
  });
}

async function createAvatarDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error("Please choose an image under 5 MB.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image upload is not supported here.");
  }

  let maxEdge = 512;
  let quality = 0.86;
  let output = source;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    output = canvas.toDataURL("image/webp", quality);
    if (output.length <= MAX_AVATAR_DATA_LENGTH) {
      return output;
    }

    maxEdge = Math.max(192, Math.round(maxEdge * 0.8));
    quality = Math.max(0.55, quality - 0.12);
  }

  if (output.length > MAX_AVATAR_DATA_LENGTH) {
    throw new Error("Please choose a smaller image.");
  }

  return output;
}

export default function SettingsPage() {
  const { isHydrated, isReady } = useProtectedRoute();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const isGuestUser = user?.status === "guest";
  const avatarInputRef = useRef(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    avatar: "",
    gender: "",
    theme: "light",
    privacy: "standard",
    chatHistoryEnabled: false
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }

    setForm({
      username: user.username || "",
      email: user.email || "",
      avatar: user.avatar || "",
      gender: user.gender || "",
      theme: normalizeTheme(user.preferences?.theme || theme),
      privacy: user.preferences?.privacy || "standard",
      chatHistoryEnabled: Boolean(user.preferences?.chatHistoryEnabled)
    });
  }, [isReady, theme, user]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("success");

    try {
      const profileResponse = await api.patch("/users/me", {
        username: form.username,
        email: isGuestUser ? undefined : form.email,
        avatar: form.avatar,
        gender: form.gender
      });
      const settingsResponse = await api.patch("/users/settings", {
        theme: form.theme,
        privacy: form.privacy,
        chatHistoryEnabled: form.chatHistoryEnabled
      });

      setUser({
        ...profileResponse.data.user,
        preferences: settingsResponse.data.user.preferences
      });
      setTheme(form.theme);
      setMessage(profileResponse.data.message);
    } catch (error) {
      setMessageType("error");
      setMessage(error?.response?.data?.message || "Could not save your profile.");
    }
  };

  const handleAvatarPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage("");
    setMessageType("success");
    setIsPreparingAvatar(true);

    try {
      const avatar = await createAvatarDataUrl(file);
      setForm((current) => ({ ...current, avatar }));
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Could not prepare that image.");
    } finally {
      setIsPreparingAvatar(false);
      event.target.value = "";
    }
  };

  const removeAvatar = () => {
    setForm((current) => ({ ...current, avatar: "" }));
  };

  const selectPresetAvatar = async (avatar) => {
    const previousAvatar = form.avatar;

    setForm((current) => ({ ...current, avatar }));
    setMessage("");
    setMessageType("success");
    setIsSavingAvatar(true);

    try {
      const response = await api.patch("/users/me", { avatar });
      setUser(response.data.user);
      setForm((current) => ({ ...current, avatar: response.data.user.avatar || "" }));
      setMessage("Avatar updated.");
      setIsAvatarPickerOpen(false);
    } catch (error) {
      setForm((current) => ({ ...current, avatar: previousAvatar }));
      setMessageType("error");
      setMessage(error?.response?.data?.message || "Could not update your avatar.");
    } finally {
      setIsSavingAvatar(false);
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
      title="Profile, privacy, theme, and chat retention controls."
      sidebarOnMobileBottom
      sidebar={
        <section className="rounded-[1rem] border border-[rgb(var(--border))] bg-card/80 p-4 sm:rounded-[1.3rem] sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand sm:text-xs sm:tracking-[0.28em]">
            Privacy guide
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-muted sm:mt-4 sm:space-y-3 sm:leading-7">
            <li>Keep chat history off for maximum anonymity.</li>
            <li>Use guest mode when you do not want an email-linked account.</li>
            <li>Block and report users directly from the chat window.</li>
          </ul>
        </section>
      }
    >
      <div className="relative">
        <section className="rounded-[1rem] border border-[rgb(var(--border))] bg-card/80 p-4 shadow-glow sm:rounded-[1.3rem] sm:p-6">
          <div className="space-y-1.5">
            <h1 className="font-display text-[1.75rem] leading-tight text-text sm:text-4xl">Edit Profile</h1>
            <p className="text-sm leading-6 text-muted">
              Update your profile, privacy, and theme preferences.
            </p>
          </div>

          <form className="mt-5 grid gap-4 sm:mt-6 sm:gap-5" onSubmit={saveSettings}>
            <div className="rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface p-4 sm:rounded-2xl">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt={form.username || "Profile"}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-lg font-semibold text-brand sm:h-20 sm:w-20 sm:text-xl">
                    {(form.username || user?.username || "U").trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:max-w-[11rem]">
                    <button
                      type="button"
                      onClick={() => setIsAvatarPickerOpen(true)}
                      disabled={isSavingAvatar}
                      className="inline-flex w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-card px-3 py-1.5 text-xs font-semibold text-text transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      Avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isPreparingAvatar || isSavingAvatar}
                      className="inline-flex w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-card px-3 py-1.5 text-xs font-semibold text-text transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {isPreparingAvatar ? "Preparing..." : form.avatar ? "Change image" : "Upload image"}
                    </button>
                    {form.avatar ? (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        disabled={isSavingAvatar}
                        className="inline-flex w-full items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-muted sm:text-xs">
                Upload an image or choose a preset avatar. PNG, JPG, or WebP up to 5 MB.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarPick}
                className="hidden"
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Name</span>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                maxLength={10}
                className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Email</span>
              <input
                type="email"
                value={form.email}
                disabled={isGuestUser}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:py-3"
                placeholder={isGuestUser ? "Guest accounts do not use email" : "name@example.com"}
              />
              {isGuestUser ? (
                <span className="mt-2 block text-xs text-muted">
                  Email is unavailable while you are using a guest account.
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Gender</span>
              <select
                value={form.gender}
                onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Theme</span>
              <select
                value={form.theme}
                onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
                className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted sm:text-sm">Privacy mode</span>
              <select
                value={form.privacy}
                onChange={(event) => setForm((current) => ({ ...current, privacy: event.target.value }))}
                className="w-full rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-brand sm:rounded-2xl sm:py-3"
              >
                <option value="standard">Standard</option>
                <option value="strict">Strict</option>
              </select>
            </label>
            <label className="flex items-start gap-3 rounded-[0.8rem] border border-[rgb(var(--border))] bg-surface px-4 py-3 sm:items-center sm:rounded-2xl sm:py-4">
              <input
                className="mt-0.5 sm:mt-0"
                type="checkbox"
                checked={form.chatHistoryEnabled}
                onChange={(event) =>
                  setForm((current) => ({ ...current, chatHistoryEnabled: event.target.checked }))
                }
              />
              <span className="text-sm leading-6 text-text sm:leading-normal">
                Enable chat history for your own account
              </span>
            </label>

            {message ? (
              <p className={messageType === "error" ? "text-sm text-red-500" : "text-sm text-accent"}>
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white sm:w-fit sm:py-3"
            >
              Save settings
            </button>
          </form>
        </section>
        {isAvatarPickerOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 lg:absolute lg:rounded-[1.3rem]"
            onClick={() => {
              if (!isSavingAvatar) {
                setIsAvatarPickerOpen(false);
              }
            }}
          >
            <div
              className="w-full max-w-xl rounded-[1.4rem] border border-[rgb(var(--border))] bg-card p-4 shadow-2xl lg:-translate-y-8 sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-text sm:text-2xl">Choose avatar</h2>
                  <p className="mt-1 text-sm text-muted">
                    Pick any avatar and it will be used as your profile photo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                  disabled={isSavingAvatar}
                  className="rounded-full border border-[rgb(var(--border))] bg-surface px-3 py-1.5 text-sm font-semibold text-text transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingAvatar ? "Saving..." : "Close"}
                </button>
              </div>

              <div className="mt-4 space-y-4 sm:mt-5">
                {avatarPresetGroups.map((group) => (
                  <div key={group.id} className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {group.items.map((item) => {
                        const isActive = form.avatar === item.value;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={item.label}
                            onClick={() => selectPresetAvatar(item.value)}
                            disabled={isSavingAvatar}
                            className={`overflow-hidden rounded-[1.1rem] border bg-surface transition ${
                              isActive
                                ? "border-brand shadow-[0_0_0_1px_rgba(var(--brand),0.4)]"
                                : "border-[rgb(var(--border))] hover:border-brand/50"
                            } ${isSavingAvatar ? "cursor-not-allowed opacity-70" : ""}`}
                          >
                            <img src={item.value} alt={item.label} className="h-20 w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

