import { Sparkles } from "lucide-react";

export function LandingFooter({ user }) {
  return (
    <footer className="mt-8 border-t border-[rgb(var(--border))] pt-6 sm:mt-12 sm:pt-8">
      <div className="py-1 sm:py-2">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
              <Sparkles size={14} />
              <span>GossipGo</span>
            </div>
            <div className="space-y-3">
              <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                Start talking instantly, reconnect with friends later, and stay in control with built-in moderation, favorites, and privacy-first settings.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Why People Stay
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-surface/60 px-4 py-3">
                <p className="text-sm font-semibold text-text">Anonymous by default</p>
                <p className="mt-1 text-sm leading-6 text-muted">Talk freely without exposing personal identity.</p>
              </div>
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-surface/60 px-4 py-3">
                <p className="text-sm font-semibold text-text">Safe conversation controls</p>
                <p className="mt-1 text-sm leading-6 text-muted">Block, report, favorite, and continue chatting on your terms.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[rgb(var(--border))] pt-4 text-center text-sm text-muted sm:mt-10">
          <p>&copy; 2026 GossipGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
