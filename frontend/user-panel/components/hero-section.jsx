"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Users, Activity, ShieldCheck, Heart } from "lucide-react";

export function HeroSection({ user }) {
  const features = useMemo(() => [
    { icon: MessageCircle, label: "Live Matching", description: "Instantly connected to active users for real-time conversation." },
    { icon: Users, label: "Community", description: "Join a growing group of users looking for authentic interaction." },
    { icon: ShieldCheck, label: "Anonymity", description: "Share what you want, when you want, without compromising identity." },
    { icon: Activity, label: "Real-time", description: "Real-time moderation and controls for a safe experience." },
  ], []);

  return (
    <div className="relative mt-6 grid w-full items-center gap-8 sm:mt-10 sm:gap-12 lg:grid-cols-2 lg:gap-24">
      <div className="flex flex-col items-start gap-6 sm:gap-8 lg:gap-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold text-brand transition hover:border-brand/40">
            <Heart size={14} fill="currentColor" />
            <span>Premium real-time chat platform</span>
          </div>
          <h1 className="font-display text-[2.5rem] leading-[1.05] text-text sm:text-6xl lg:text-7xl">
            Talk to <span className="text-brand">anyone,</span> anywhere.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-xl sm:leading-relaxed lg:text-2xl lg:leading-relaxed">
            Experience authentic anonymous chat with live matchmaking, history tracking, and world-class moderation.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-3 pt-2 sm:gap-6 sm:pt-4">
          <Link
            href={user ? "/chat" : "/register"}
            className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-1 hover:shadow-brand/40 sm:w-auto sm:px-10 sm:py-5 sm:text-lg lg:px-12"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-all duration-500 group-hover:left-full" />
            <span>{user ? "Enter Chat Room" : "Start Chatting Now"}</span>
            <MessageCircle size={20} />
          </Link>
          <button
            type="button"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface transition hover:-translate-y-1 hover:border-brand/40 hover:bg-card/50 sm:h-16 sm:w-16"
          >
            <Users size={24} className="text-text" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-start gap-4 overflow-hidden sm:mt-12 sm:flex-row sm:items-center sm:gap-6">
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
          <p className="text-[13px] font-semibold text-muted sm:text-sm">
            Join <span className="text-text">50,000+</span> active users already chatting!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {features.map(({ icon: Icon, label, description }) => (
          <article
            key={label}
            className="group relative flex flex-col gap-4 rounded-[1.6rem] border border-[rgb(var(--border))] bg-card p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand/40 hover:bg-surface/50 hover:shadow-2xl sm:rounded-[2rem] sm:p-8"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white group-hover:shadow-glow sm:h-16 sm:w-16 sm:rounded-3xl">
              <Icon size={28} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-text group-hover:text-brand sm:text-2xl">{label}</h3>
              <p className="text-sm leading-relaxed text-muted group-hover:text-muted/80 sm:text-base">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
