import { NextResponse } from "next/server";
import { setAdminCookie, verifyAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
      { status: 303 },
    );
  }

  const response = NextResponse.redirect(new URL("/admin/bookings", request.url), {
    status: 303,
  });
  setAdminCookie(response, email.trim().toLowerCase());

  return response;
}
