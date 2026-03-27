import { AdminLoginForm } from "@/admin/components/admin-login-form";

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = params?.next || "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 md:px-8 md:py-10">
      <AdminLoginForm nextPath={nextPath} />
    </main>
  );
}
