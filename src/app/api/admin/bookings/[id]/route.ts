import { NextRequest, NextResponse } from "next/server";
import { bookingStatusSchema } from "@/lib/booking-schema";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deleteBookingInquiry,
  updateBookingStatus,
} from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null) as { status?: unknown } | null;
  const parsed = bookingStatusSchema.safeParse(payload?.status);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid booking status." },
      { status: 422 },
    );
  }

  try {
    const booking = await updateBookingStatus(id, parsed.data);
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("Admin booking status update failed", error);
    return NextResponse.json(
      { ok: false, message: "Could not update booking status." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteBookingInquiry(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin booking delete failed", error);
    return NextResponse.json(
      { ok: false, message: "Could not delete booking inquiry." },
      { status: 500 },
    );
  }
}
