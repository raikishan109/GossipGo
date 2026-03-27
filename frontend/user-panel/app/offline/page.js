"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-lg rounded-[2rem] border border-[rgb(var(--border))] bg-card/90 p-8 text-center shadow-glow sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Offline</p>
        <h1 className="mt-4 font-display text-4xl text-text sm:text-5xl">You&apos;re offline</h1>
        <p className="mt-4 text-sm text-muted sm:text-base">
          GossipGo saved a lightweight shell for you, but this page needs a connection to fully refresh.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center rounded-full border border-[rgb(var(--border))] px-6 py-3 text-sm font-semibold text-text sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
