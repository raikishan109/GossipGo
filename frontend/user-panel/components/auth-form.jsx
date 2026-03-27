"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, Info } from "lucide-react";

export function AuthForm({
  type = "login",
  mode,
  onSubmit,
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
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-6 rounded-[1.8rem] border border-[rgb(var(--border))] bg-card p-5 shadow-2xl shadow-brand/5 sm:gap-8 sm:rounded-[2.5rem] sm:p-10">
        <div className="flex flex-col gap-2">
          <Link href={brandHref} className="mb-2 inline-flex items-center text-text transition hover:text-brand">
            <span className="font-display text-[1.75rem] font-bold sm:text-3xl">Gossip<span className="text-brand">Go</span></span>
          </Link>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[1.65rem] font-bold text-text sm:text-3xl">
            {title || (isLogin ? "Welcome back" : "Create an account")}
          </h1>
          <p className="text-sm text-muted">
            {description || (isLogin ? "Enter your credentials to access your account" : "Join the world's most anonymous chat platform")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="group relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand"><User size={18} /></span>
               <input
                required
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-2xl border border-[rgb(var(--border))] bg-surface py-3.5 pl-11 pr-4 text-sm text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5"
              />
            </div>
          )}
          <div className="group relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand"><Mail size={18} /></span>
             <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-surface py-3.5 pl-11 pr-4 text-sm text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5"
            />
          </div>
          <div className="group relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-brand"><Lock size={18} /></span>
             <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-surface py-3.5 pl-11 pr-4 text-sm text-text outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/5"
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
            className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:shadow-brand/40 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <span>{submitLabel || (isLogin ? "Sign In" : "Get Started")}</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {!hideSwitch ? (
        <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted">
              {switchPrompt || (isLogin ? "Do not have an account?" : "Already have an account?")}{" "}
              <Link href={switchHref || (isLogin ? "/register" : "/login")} className="font-bold text-brand hover:underline">
                {switchLabel || (isLogin ? "Sign up" : "Sign in")}
              </Link>
            </p>
        </div>
        ) : null}
      </div>
      
      <p className="mt-8 text-center text-xs leading-relaxed text-muted">
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
