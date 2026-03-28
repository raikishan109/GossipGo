"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, Info } from "lucide-react";

export function AuthForm({
  type = "login",
  mode,
  onSubmit,
  onGuestContinue,
  eyebrow = "",
  title,
  description,
  submitLabel,
  switchHref,
  switchPrompt,
  switchLabel,
  brandHref = "/",
  footerNote,
  hideSwitch = false,
}) {
  const resolvedType = mode || type;
  const isLogin = resolvedType === "login";
  const [form, setForm] = useState({
    identifier: "",
    username: "",
    email: "",
    password: "",
  });
  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState("");
  const loading = loadingMode !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingMode("submit");
    setError("");
    
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingMode(null);
    }
  };

  const handleGuestContinue = async () => {
    if (typeof onGuestContinue !== "function") {
      return;
    }

    setLoadingMode("guest");
    setError("");

    try {
      await onGuestContinue();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-5 rounded-[1.5rem] border border-[rgb(var(--border))] bg-card p-4 shadow-2xl shadow-brand/5 sm:gap-8 sm:rounded-[2.5rem] sm:p-10">
        <div className="flex flex-col gap-2">
          <Link href={brandHref} className="mb-2 inline-flex items-center text-text transition hover:text-brand">
            <span className="font-display text-[1.6rem] font-bold sm:text-3xl">Gossip<span className="text-brand">Go</span></span>
          </Link>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[1.45rem] font-bold leading-tight text-text sm:text-3xl">
            {title || (isLogin ? "Welcome back" : "Create an account")}
          </h1>
          <p className="text-[15px] leading-6 text-muted sm:text-sm">
            {description || (isLogin ? "Enter your credentials to access your account" : "Join the world's most anonymous chat platform")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
          {!isLogin && (
            <div className="group relative">
               <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand sm:left-4"><User size={18} /></span>
               <input
                required
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-[1.1rem] border border-[rgb(var(--border))] bg-surface py-3 pl-10 pr-4 text-base text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:text-sm"
              />
            </div>
          )}
          <div className="group relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand sm:left-4"><Mail size={18} /></span>
             <input
              required
              type={isLogin ? "text" : "email"}
              placeholder={isLogin ? "Email or username" : "Email address"}
              value={isLogin ? form.identifier : form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  ...(isLogin
                    ? { identifier: e.target.value }
                    : { email: e.target.value }),
                })
              }
              className="w-full rounded-[1.1rem] border border-[rgb(var(--border))] bg-surface py-3 pl-10 pr-4 text-base text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:text-sm"
            />
          </div>
          <div className="group relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand sm:left-4"><Lock size={18} /></span>
             <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-[1.1rem] border border-[rgb(var(--border))] bg-surface py-3 pl-10 pr-4 text-base text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5 sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-[13px] font-semibold text-red-500">
              <Info size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="group relative mt-1 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[1.1rem] bg-brand text-[15px] font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:shadow-brand/40 disabled:opacity-70 disabled:hover:translate-y-0 sm:mt-2 sm:h-14 sm:rounded-full sm:text-base"
          >
            {loadingMode === "submit" ? (
              <Loader2 size={22} className="animate-spin sm:h-6 sm:w-6" />
            ) : (
              <>
                <span>{submitLabel || (isLogin ? "Sign In" : "Get Started")}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </>
            )}
          </button>
        </form>

        {typeof onGuestContinue === "function" ? (
          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.1rem] border border-[rgb(var(--border))] bg-surface text-[15px] font-semibold text-text transition hover:bg-surface/70 disabled:opacity-70 sm:h-14 sm:rounded-full sm:text-base"
          >
            {loadingMode === "guest" ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <User size={18} />
                <span>Continue as Guest</span>
              </>
            )}
          </button>
        ) : null}

        {!hideSwitch ? (
        <div className="flex flex-col gap-4 text-center">
            <p className="text-[15px] leading-6 text-muted sm:text-sm">
              {switchPrompt || (isLogin ? "Do not have an account?" : "Already have an account?")}{" "}
              <Link href={switchHref || (isLogin ? "/register" : "/login")} className="font-bold text-brand hover:underline">
                {switchLabel || (isLogin ? "Sign up" : "Sign in")}
              </Link>
            </p>
        </div>
        ) : null}
      </div>
      
      <p className="mt-6 px-2 text-center text-[11px] leading-relaxed text-muted sm:mt-8 sm:text-xs">
         {footerNote || (
          <>
            By continuing, you agree to GossipGo's <br />
            <span className="font-semibold text-text">Terms of Service</span> and <span className="font-semibold text-text">Privacy Policy</span>.
          </>
         )}
      </p>
    </div>
  );
}
