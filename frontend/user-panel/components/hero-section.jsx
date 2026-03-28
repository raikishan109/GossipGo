"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Users, Activity, ShieldCheck } from "lucide-react";

export function HeroSection({ user }) {
  const features = useMemo(() => [
    { icon: MessageCircle, label: "Live Matching", description: "Instantly connected to active users for real-time conversation." },
    { icon: Users, label: "Community", description: "Join a growing group of users looking for authentic interaction." },
    { icon: ShieldCheck, label: "Anonymity", description: "Share what you want, when you want, without compromising identity." },
    { icon: Activity, label: "Real-time", description: "Real-time moderation and controls for a safe experience." },
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

        <div className="flex w-full flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:pt-3 lg:justify-start lg:gap-6 lg:pt-4">
          <Link
            href={user ? "/chat" : "/register"}
            className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-1 hover:shadow-brand/40 sm:w-auto sm:min-w-[15rem] sm:px-8 sm:py-4 sm:text-lg lg:px-12 lg:py-5"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-all duration-500 group-hover:left-full" />
            <span>{user ? "Enter Chat Room" : "Start Chatting Now"}</span>
            <MessageCircle size={20} />
          </Link>

          <Link
            href="#home-features"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border))] bg-surface px-5 py-4 text-sm font-semibold text-text transition hover:-translate-y-1 hover:border-brand/40 hover:bg-card/50 sm:w-auto sm:px-6 sm:text-base"
          >
            <Users size={18} className="text-brand" />
            <span>Explore Features</span>
          </Link>
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

      <div id="home-features" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {features.map(({ icon: Icon, label, description }) => (
          <article
            key={label}
            className="group relative flex flex-col gap-3 rounded-[1.4rem] border border-[rgb(var(--border))] bg-card p-4 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand/40 hover:bg-surface/50 hover:shadow-2xl sm:gap-4 sm:rounded-[2rem] sm:p-7"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white group-hover:shadow-glow sm:h-16 sm:w-16 sm:rounded-3xl">
              <Icon size={24} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-text group-hover:text-brand sm:text-2xl">{label}</h3>
              <p className="text-sm leading-6 text-muted group-hover:text-muted/80 sm:text-base sm:leading-relaxed">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
