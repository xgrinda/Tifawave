import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { seedContentSection } from "@/lib/content-store";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as {
    section?: string;
  } | null;

  if (!payload?.section) {
    return NextResponse.json(
      { ok: false, message: "Missing content section." },
      { status: 422 },
    );
  }

  try {
    const data = await seedContentSection(payload.section);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Admin content seed failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Could not publish content.",
      },
      { status: 500 },
    );
  }
}
