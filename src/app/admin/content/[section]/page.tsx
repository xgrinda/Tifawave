import { redirect } from "next/navigation";
import { ContentAdmin } from "@/components/admin/content-admin";
import { contentSectionSchema } from "@/lib/content-schema";
import { listAdminContentItems } from "@/lib/content-store";
import { getAdminSession } from "@/lib/admin-auth";

type AdminContentPageProps = {
  params: Promise<{ section: string }>;
};

export const metadata = {
  title: "Content Admin | Tifawave",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminContentPage({
  params,
}: AdminContentPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { section: sectionParam } = await params;
  const section = contentSectionSchema.safeParse(sectionParam);

  if (!section.success) {
    redirect("/admin/content/settings");
  }

  let data: Awaited<ReturnType<typeof listAdminContentItems>> | null = null;
  let setupError: string | null = null;

  try {
    data = await listAdminContentItems(section.data);
  } catch (error) {
    setupError =
      error instanceof Error ? error.message : "Could not load website content.";
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[var(--foam)] py-10 sm:py-14">
      <div className="container-shell">
        {setupError || !data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-bold">Content CMS setup needed</p>
            <p className="mt-2 text-sm leading-6">{setupError}</p>
            <p className="mt-2 text-sm leading-6">
              Run the latest SQL in supabase/schema.sql, then refresh this page.
            </p>
          </div>
        ) : (
          <ContentAdmin
            adminEmail={session.email}
            section={data.section}
            initialItems={data.items}
            isSeeded={data.isSeeded}
          />
        )}
      </div>
    </section>
  );
}
