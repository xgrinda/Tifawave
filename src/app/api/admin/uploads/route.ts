import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const maxUploadBytes = 8 * 1024 * 1024;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "tifawave-content";
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const section = sanitizeSegment(String(formData?.get("section") ?? "cms"));

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "Choose an image file to upload." },
      { status: 422 },
    );
  }

  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { ok: false, message: "Upload a JPG, PNG, WebP, or AVIF image." },
      { status: 422 },
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { ok: false, message: "Images must be smaller than 8 MB." },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdminClient();
  const uploadPath = [
    section,
    new Date().toISOString().slice(0, 10),
    `${randomUUID()}.${extension}`,
  ].join("/");
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(storageBucket)
    .upload(uploadPath, buffer, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Admin image upload failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Could not upload image. Check the Supabase Storage bucket setup.",
      },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(uploadPath);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl,
    path: uploadPath,
    bucket: storageBucket,
  });
}

function sanitizeSegment(value: string) {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "cms";
}
