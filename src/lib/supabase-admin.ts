import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingInquiry,
  BookingStatus,
  StoredBookingInquiry,
} from "@/lib/booking-schema";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingInquiryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  whatsapp: string;
  check_in: string;
  check_out: string;
  guests: number;
  room_type: string;
  package_type: string;
  message: string;
  status: BookingStatus;
  source: string;
};

export type WebsiteContentRow = {
  id: string;
  created_at: string;
  updated_at: string;
  content_type: string;
  item_key: string;
  position: number;
  payload: Json;
};

type Database = {
  public: {
    Tables: {
      booking_inquiries: {
        Row: BookingInquiryRow;
        Insert: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          whatsapp: string;
          check_in: string;
          check_out: string;
          guests: number;
          room_type: string;
          package_type: string;
          message: string;
          status: BookingStatus;
          source: string;
        };
        Update: Partial<
          Pick<
            BookingInquiryRow,
            | "name"
            | "email"
            | "whatsapp"
            | "check_in"
            | "check_out"
            | "guests"
            | "room_type"
            | "package_type"
            | "message"
            | "status"
          >
        >;
        Relationships: [];
      };
      website_content: {
        Row: WebsiteContentRow;
        Insert: {
          id: string;
          content_type: string;
          item_key: string;
          position: number;
          payload: Json;
        };
        Update: Partial<
          Pick<WebsiteContentRow, "content_type" | "item_key" | "position" | "payload">
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

export async function createBookingInquiry(
  inquiry: StoredBookingInquiry,
): Promise<StoredBookingInquiry> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_inquiries")
    .insert(toBookingInsert(inquiry))
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return fromBookingRow(data);
}

export async function listBookingInquiries() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase select failed: ${error.message}`);
  }

  return data.map(fromBookingRow);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_inquiries")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase status update failed: ${error.message}`);
  }

  return fromBookingRow(data);
}

export async function deleteBookingInquiry(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("booking_inquiries")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

function toBookingInsert(inquiry: StoredBookingInquiry) {
  return {
    id: inquiry.id,
    created_at: inquiry.createdAt,
    name: inquiry.name,
    email: inquiry.email,
    whatsapp: inquiry.whatsapp,
    check_in: inquiry.checkIn,
    check_out: inquiry.checkOut,
    guests: inquiry.guests,
    room_type: inquiry.roomType,
    package_type: inquiry.packageType,
    message: inquiry.message,
    status: inquiry.status,
    source: inquiry.source,
  };
}

function fromBookingRow(row: BookingInquiryRow): StoredBookingInquiry {
  const inquiry: BookingInquiry = {
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    roomType: row.room_type,
    packageType: row.package_type,
    message: row.message,
  };

  return {
    ...inquiry,
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    source: "website",
  };
}
