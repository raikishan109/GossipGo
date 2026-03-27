"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Mic,
  RefreshCcw,
  Send,
  ShieldAlert,
  SmilePlus,
  StopCircle,
  UserMinus,
} from "lucide-react";
import clsx from "clsx";

export function ChatPanel({ 
  user, 
  messages,
  status,
  partner,
  isPartnerTyping,
  queueMessage,
  error,
  onJoinQueue, 
  onCancelQueue,
  onSendMessage, 
  onTyping, 
  onNextChat, 
  onEndChat, 
  onBlockUser, 
  onReportUser 
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const currentUserId = user?.id || user?._id || null;
  const partnerId = partner?.id || partner?._id || null;
  const partnerLabel = partner?.alias || partner?.username || "Chat Partner";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    onTyping(true);
  };

  if (status === "idle") {
    return (
      <div className="mx-auto flex min-h-[28rem] w-full max-w-4xl flex-col items-center justify-center gap-6 rounded-[1.8rem] border border-[rgb(var(--border))] bg-card/60 p-6 text-center shadow-glow sm:h-[40rem] sm:gap-8 sm:rounded-[2.5rem] sm:p-20">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand shadow-glow shadow-brand/20 sm:h-32 sm:w-32">
            <Send size={48} className="sm:h-16 sm:w-16" />
          </div>
          <h2 className="font-display text-3xl text-text sm:text-5xl lg:text-6xl">Ready to chat?</h2>
          <p className="mx-auto max-w-sm text-base text-muted sm:text-lg lg:text-xl">
            You are 100% anonymous. Click below to find a random partner instantly.
          </p>
        </div>
        {error ? (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
            {error}
          </p>
        ) : null}
        <button
          onClick={onJoinQueue}
          className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-1 hover:shadow-brand/40 sm:w-auto sm:px-16 sm:py-6 sm:text-xl"
        >
          <span className="absolute inset-x-0 top-0 h-px bg-white/20" />
          <span>Find Someone Now</span>
          <RefreshCcw size={24} className="transition-transform group-hover:rotate-180" />
        </button>
      </div>
    );
  }

  if (status === "searching") {
    return (
      <div className="mx-auto flex min-h-[28rem] w-full max-w-4xl flex-col items-center justify-center gap-8 rounded-[1.8rem] border border-[rgb(var(--border))] bg-card/60 p-6 text-center shadow-glow sm:h-[40rem] sm:gap-10 sm:rounded-[2.5rem] sm:p-20">
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
           <div className="absolute inset-0 animate-ping rounded-full bg-brand/10" />
           <div className="absolute inset-4 animate-ping rounded-full bg-brand/20 [animation-delay:0.2s]" />
           <div className="absolute inset-8 animate-ping rounded-full bg-brand/30 [animation-delay:0.4s]" />
           <RefreshCcw size={48} className="animate-spin text-brand sm:h-16 sm:w-16" />
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <h2 className="font-display text-3xl text-text sm:text-4xl lg:text-5xl">Searching...</h2>
          <p className="text-base text-muted sm:text-lg lg:text-xl">
            {queueMessage || "Looking for your perfect chat partner"}
          </p>
        </div>
        {error ? (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
            {error}
          </p>
        ) : null}
        <button
          onClick={onCancelQueue}
          className="w-full rounded-full border border-[rgb(var(--border))] bg-surface px-6 py-3 text-base font-semibold text-text transition hover:bg-red-500 hover:text-white sm:w-auto sm:px-12 sm:py-4 sm:text-lg"
        >
          Cancel Search
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[34rem] max-h-[48rem] flex-col overflow-hidden rounded-[1.8rem] border border-[rgb(var(--border))] bg-card/80 shadow-2xl backdrop-blur-xl sm:h-[48rem] sm:rounded-[2.5rem]">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-[rgb(var(--border))] bg-surface/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-brand/20 bg-brand/10 transition sm:h-12 sm:w-12">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId || partnerLabel || "anonymous"}`} alt={partnerLabel} />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-green-500" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-text sm:text-lg">{partnerLabel}</h3>
            {isPartnerTyping ? (
              <p className="text-[11px] font-semibold text-brand sm:text-xs">Partner is typing...</p>
            ) : (
              <p className="text-[11px] text-muted sm:text-xs">Active now</p>
            )}
          </div>
        </div>

        <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <button
            onClick={() => onNextChat()}
            className="flex h-10 w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface text-text transition hover:bg-brand hover:text-white sm:h-12 sm:w-12"
            title="Next Chat"
          >
            <RefreshCcw size={18} className="sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={onEndChat}
            className="flex h-10 w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface text-text transition hover:bg-red-500 hover:text-white sm:h-12 sm:w-12"
            title="End Chat"
          >
            <StopCircle size={18} className="sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onBlockUser(partnerId)}
            className="flex h-10 w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface text-muted transition hover:bg-red-50 hover:text-red-600 sm:h-12 sm:w-12"
            title="Block User"
          >
            <UserMinus size={18} className="sm:h-5 sm:w-5" />
          </button>
          <button
             onClick={() => onReportUser(partnerId)}
            className="flex h-10 w-full items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface text-muted transition hover:bg-red-500 hover:text-white sm:h-12 sm:w-12"
            title="Report User"
          >
            <ShieldAlert size={18} className="sm:h-5 sm:w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand/20 hover:[&::-webkit-scrollbar-thumb]:bg-brand/40"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="rounded-full bg-brand/5 px-4 py-1 text-[11px] font-bold text-brand sm:text-xs">SYSTEM: MATCHED SUCCESSFULLY</span>
            <p className="mt-2 text-[10px] text-muted sm:text-xs">Say hello! Everyone in this chat is anonymous.</p>
        </div>

        {messages.map((msg, i) => (
          <div
            key={msg.id || `${msg.senderId || "message"}-${i}`}
            className={clsx(
              "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[85%] rounded-3xl px-4 py-3 text-sm transition-all sm:max-w-[65%] sm:px-6 sm:py-3.5 sm:text-base",
                msg.senderId === currentUserId
                  ? "bg-brand text-white shadow-lg shadow-brand/10 rounded-tr-none"
                  : "bg-surface text-text border border-[rgb(var(--border))] rounded-tl-none"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <footer className="shrink-0 border-t border-[rgb(var(--border))] bg-surface/30 p-4 sm:p-8">
        <form onSubmit={handleSend} className="flex items-center gap-2 rounded-[1.25rem] border border-[rgb(var(--border))] bg-card px-3 py-2 focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/5 sm:gap-4 sm:rounded-[2rem] sm:px-6 sm:py-3">
          <button type="button" className="flex h-10 w-10 items-center justify-center text-muted transition hover:text-brand sm:h-12 sm:w-12">
            <SmilePlus size={24} strokeWidth={2.2} />
          </button>
          <div className="hidden h-6 w-px bg-[rgb(var(--border))] sm:block sm:h-8" />
          <input
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-text outline-none sm:text-base"
          />
          <div className="hidden items-center gap-2 sm:flex">
             <button type="button" className="text-muted transition hover:text-brand"><Mic size={20} /></button>
             <button type="button" className="text-muted transition hover:text-brand"><ImagePlus size={20} /></button>
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12",
              input.trim() ? "bg-brand text-white shadow-glow shadow-brand/20 scale-105" : "bg-muted/10 text-muted grayscale"
            )}
          >
            <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
          </button>
        </form>
      </footer>
    </div>
  );
}
