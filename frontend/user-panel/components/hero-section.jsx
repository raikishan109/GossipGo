"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Users, Activity, ShieldCheck } from "lucide-react";
import { PwaInstallButton } from "@/user/components/pwa-install-button";

export function HeroSection({ user }) {
  const features = useMemo(() => [
    {
      icon: MessageCircle,
      label: "Live Matching",
      description: "Instantly connected to active users for real-time conversation.",
      iconClassName: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-500"
    },
    {
      icon: Users,
      label: "Community",
      description: "Join a growing group of users looking for authentic interaction.",
      iconClassName: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500"
    },
    {
      icon: ShieldCheck,
      label: "Anonymity",
      description: "Share what you want, when you want, without compromising identity.",
      iconClassName: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500"
    },
    {
      icon: Activity,
      label: "Real-time",
      description: "Real-time moderation and controls for a safe experience.",
      iconClassName: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500"
    },
  ], []);

  return (
    <div className="relative mt-4 grid w-full items-center gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col items-center gap-6 text-center sm:gap-8 lg:items-start lg:gap-10 lg:text-left">
        <div className="flex flex-col gap-4 sm:gap-5">
          <h1 className="font-display text-[2.15rem] leading-[1.03] text-text sm:text-5xl lg:text-7xl">
            Talk to <span className="text-brand">anyone,</span> anywhere.
          </h1>
          <p className="max-w-[38rem] text-[0.98rem] leading-7 text-muted sm:text-lg sm:leading-8 lg:text-2xl lg:leading-relaxed">
            Experience authentic anonymous chat with live matchmaking, history tracking, and world-class moderation.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 px-1 pt-1 sm:max-w-[31rem] sm:gap-3 sm:px-0 sm:pt-3 lg:max-w-[36rem] lg:pt-4">
          <Link
            href={user ? "/chat" : "/register"}
            className="group relative inline-flex min-w-0 w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-brand px-3 py-3.5 text-[12px] font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-1 hover:shadow-brand/40 whitespace-nowrap sm:gap-2.5 sm:px-8 sm:py-4 sm:text-lg"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-all duration-500 group-hover:left-full" />
            <span>{user ? "Enter Chat Room" : "Start Chatting Now"}</span>
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>

          <PwaInstallButton buttonClassName="h-full gap-1.5 px-3 text-[12px] whitespace-nowrap sm:gap-2 sm:px-8 sm:text-lg sm:font-bold" />
        </div>

        <div className="mt-4 flex w-full max-w-md flex-col items-center gap-4 overflow-hidden sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center sm:gap-6 lg:justify-start">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-10 overflow-hidden rounded-full border-2 border-card bg-brand/10 transition hover:z-10 hover:scale-110 sm:h-12 sm:w-12"
              >
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" />
              </div>
            ))}
          </div>
          <p className="max-w-xs text-sm font-semibold leading-6 text-muted sm:max-w-sm sm:text-sm lg:max-w-none">
            Join <span className="text-text">50,000+</span> active users already chatting!
          </p>
        </div>
      </div>

      <div id="home-features" className="grid grid-cols-2 gap-2 sm:gap-5 lg:gap-6">
        {features.map(({ icon: Icon, label, description, iconClassName }) => (
          <article
            key={label}
            className="group relative flex flex-col gap-2 rounded-[1.2rem] border border-[rgb(var(--border))] bg-card p-3 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand/40 hover:bg-surface/50 hover:shadow-2xl sm:gap-4 sm:rounded-[2rem] sm:p-7"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition group-hover:text-white group-hover:shadow-glow sm:h-16 sm:w-16 sm:rounded-3xl ${iconClassName}`}>
              <Icon size={20} strokeWidth={2} className="sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-text group-hover:text-brand sm:text-2xl">{label}</h3>
              <p className="text-xs leading-5 text-muted group-hover:text-muted/80 sm:text-base sm:leading-relaxed">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
