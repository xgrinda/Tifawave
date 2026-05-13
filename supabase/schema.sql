-- Tifawave Surf Stay Tamraght - booking inquiry schema
-- Run this SQL in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Public bucket used by the admin CMS for room, package, gallery, and hero
-- images. Uploads are handled by Next.js server routes using the service role
-- key; browser users never receive Supabase write credentials.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tifawave-content',
  'tifawave-content',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  whatsapp text not null,
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0 and guests <= 16),
  room_type text not null,
  package_type text not null,
  message text not null,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'confirmed', 'cancelled')
  ),
  source text not null default 'website'
);

create index if not exists booking_inquiries_created_at_idx
  on public.booking_inquiries (created_at desc);

create index if not exists booking_inquiries_status_idx
  on public.booking_inquiries (status);

create table if not exists public.website_content (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  content_type text not null check (
    content_type in (
      'settings',
      'rooms',
      'packages',
      'gallery',
      'faqs',
      'testimonials'
    )
  ),
  item_key text not null,
  position integer not null default 0,
  payload jsonb not null,
  unique (content_type, item_key)
);

create index if not exists website_content_type_position_idx
  on public.website_content (content_type, position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists booking_inquiries_set_updated_at
  on public.booking_inquiries;

create trigger booking_inquiries_set_updated_at
before update on public.booking_inquiries
for each row
execute function public.set_updated_at();

drop trigger if exists website_content_set_updated_at
  on public.website_content;

create trigger website_content_set_updated_at
before update on public.website_content
for each row
execute function public.set_updated_at();

alter table public.booking_inquiries enable row level security;
alter table public.website_content enable row level security;

-- No public policies are added on purpose.
-- This application reads/writes bookings only from Next.js server routes using
-- SUPABASE_SERVICE_ROLE_KEY. Do not expose the service role key in the browser.
