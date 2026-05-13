import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteContentItem } from "@/lib/content-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteContentItem(decodeURIComponent(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin content delete failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Could not delete content.",
      },
      { status: 500 },
    );
  }
}
