import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-[rgb(var(--border))] bg-card/80 p-8 text-center shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">404</p>
        <h1 className="mt-4 font-display text-4xl text-text">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The page you were looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
