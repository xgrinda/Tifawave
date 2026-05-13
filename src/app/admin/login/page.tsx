import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Admin Login | Tifawave",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = searchParams ? await searchParams : {};
  const hasError = params.error === "invalid";

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[var(--foam)] py-16">
      <div className="container-shell max-w-md">
        <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6 premium-shadow sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracotta)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--ocean-deep)]">
            Booking dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Sign in to manage Tifawave booking inquiries.
          </p>

          {hasError ? (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Invalid admin email or password.
            </p>
          ) : null}

          <form action="/api/admin/login" method="post" className="mt-7 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--ocean-deep)]">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                className="min-h-12 rounded-lg border border-[rgba(23,49,59,0.14)] bg-[var(--foam)] px-4 text-sm outline-none focus:border-[var(--sunset)] focus:bg-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--ocean-deep)]">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="min-h-12 rounded-lg border border-[rgba(23,49,59,0.14)] bg-[var(--foam)] px-4 text-sm outline-none focus:border-[var(--sunset)] focus:bg-white"
              />
            </label>
            <button
              type="submit"
              className="mt-2 min-h-12 rounded-full bg-[var(--ocean-deep)] px-5 text-sm font-bold text-white transition hover:bg-[var(--ocean)]"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
