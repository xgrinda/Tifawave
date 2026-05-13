import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  listAdminContentItems,
  upsertContentItem,
} from "@/lib/content-store";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const section = request.nextUrl.searchParams.get("section") ?? "rooms";

  try {
    const data = await listAdminContentItems(section);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Admin content load failed", error);
    return NextResponse.json(
      { ok: false, message: getErrorMessage(error, "Could not load content.") },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as {
    section?: string;
    payload?: unknown;
    position?: number;
    previousId?: string;
  } | null;

  if (!payload?.section || !payload.payload) {
    return NextResponse.json(
      { ok: false, message: "Missing content section or payload." },
      { status: 422 },
    );
  }

  try {
    const item = await upsertContentItem({
      section: payload.section,
      payload: payload.payload,
      position: payload.position,
      previousId: payload.previousId,
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("Admin content save failed", error);
    return NextResponse.json(
      { ok: false, message: getErrorMessage(error, "Could not save content.") },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
