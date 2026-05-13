# Tifawave Surf Stay Tamraght

Premium Next.js website for a surf hostel and surf package business in Tamraght, Morocco.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Supabase
- Zod validation
- Vercel-ready API route for booking inquiries

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

## Booking Inquiries

The booking form posts to `POST /api/booking`.

It currently:

- validates every field with Zod
- creates a unique inquiry id
- saves the inquiry to Supabase
- sends a transactional email through Resend when configured
- applies basic spam checks with honeypot, timing, link count, and IP rate limit
- saves a JSONL backup locally in `.data/booking-inquiries.jsonl`
- returns a prepared WhatsApp confirmation link

No online payment is included. The API is intentionally structured so a future Stripe deposit flow can attach to the created inquiry id.

## Environment Variables

Copy `.env.example` to `.env.local` and adjust:

```bash
NEXT_PUBLIC_SITE_URL=https://tifawave.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=tifawave-content
ADMIN_EMAIL=admin@tifawave.com
ADMIN_PASSWORD=use-a-strong-password
BOOKING_RECIPIENT_EMAIL=hello@tifawave.com
BOOKING_STORE_PATH=.data/booking-inquiries.jsonl
RESEND_API_KEY=re_xxxxxxxxx
BOOKING_EMAIL_FROM="Tifawave Bookings <bookings@tifawave.com>"
```

`NEXT_PUBLIC_SITE_URL` is the public production origin used for canonical URLs, Open Graph links, `robots.txt`, and `sitemap.xml`. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` connect the website to Supabase. `RESEND_API_KEY` and `BOOKING_EMAIL_FROM` enable email delivery through Resend. Add the same production values in Vercel Project Settings > Environment Variables.

Never commit `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `RESEND_API_KEY` server-side only. Only variables prefixed with `NEXT_PUBLIC_` are intended to be visible in browser code.

### Launch Environment Checklist

- Required site URL: `NEXT_PUBLIC_SITE_URL`
- Required Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- Required admin login: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Required booking receiver: `BOOKING_RECIPIENT_EMAIL`
- Required for booking email delivery: `RESEND_API_KEY`, `BOOKING_EMAIL_FROM`
- Optional local fallback only: `BOOKING_STORE_PATH`

SMTP placeholders are included in `.env.example` for a future Nodemailer swap, but the current production sender uses Resend's HTTP API to keep the Vercel deployment lightweight.

On Vercel, file writes are temporary. Supabase is the durable production booking and CMS content store; `BOOKING_STORE_PATH` is only a local development backup.

## Supabase Production Setup

1. Create a Supabase project for production.
2. Choose the closest region to your expected guests/admin team.
3. Open Project Settings > API.
4. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
5. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`.
7. Set `SUPABASE_STORAGE_BUCKET=tifawave-content`.
8. Open SQL Editor and run the full `supabase/schema.sql` file.
9. Confirm these tables exist: `public.booking_inquiries`, `public.website_content`.
10. Confirm Storage contains a public bucket named `tifawave-content`.
11. Sign in to `/admin/login`, open `/admin/content/settings`, and publish each starter CMS section if the database is still empty.

Row level security is enabled and no public write policies are added. The app reads and writes bookings, CMS content, and uploads only from Next.js server routes using `SUPABASE_SERVICE_ROLE_KEY`. Do not expose the service role key in browser code.

## Resend Email Setup

1. Create or open a Resend account.
2. Add a sending domain or subdomain, for example `bookings.tifawave.com` or `mail.tifawave.com`.
3. Add the SPF and DKIM DNS records shown by Resend. Add DMARC as recommended by your domain/email policy.
4. Wait until the domain status is verified.
5. Create a Sending access API key.
6. Add `RESEND_API_KEY` to Vercel.
7. Set `BOOKING_EMAIL_FROM` to a sender on the verified domain, for example `Tifawave Bookings <bookings@bookings.tifawave.com>`.
8. Set `BOOKING_RECIPIENT_EMAIL` to the real inbox that should receive guest inquiries.
9. Submit one test booking after deployment and confirm the email arrives.

If Resend is not configured, the booking form still saves the inquiry in Supabase and returns the WhatsApp fallback. Email delivery is optional for local development, but should be configured before accepting real production inquiries.

## Admin Dashboard

Admin routes:

- `/admin/login`
- `/admin/bookings`

Admin login uses:

```bash
ADMIN_EMAIL=admin@tifawave.com
ADMIN_PASSWORD=use-a-strong-password
```

There is no separate Supabase auth user to create for this lightweight dashboard. Set the admin email/password in `.env.local` and Vercel. The app creates a signed HTTP-only admin cookie after login.

Production admin setup:

1. Use an inbox you control for `ADMIN_EMAIL`.
2. Generate a long unique `ADMIN_PASSWORD`.
3. Store both values in Vercel Environment Variables for Production and Preview.
4. Redeploy after changing `ADMIN_PASSWORD`; existing admin cookies will no longer validate because the password signs the session token.
5. Do not share the admin URL or password with guests or public collaborators.

The bookings dashboard can:

- view inquiry details
- update status: `new`, `contacted`, `confirmed`, `cancelled`
- delete inquiries

## Admin Content Management

Admin content routes:

- `/admin/content/settings`
- `/admin/content/rooms`
- `/admin/content/packages`
- `/admin/content/gallery`
- `/admin/content/faqs`
- `/admin/content/testimonials`

The CMS stores editable website content in Supabase table `public.website_content`.
The TypeScript files in `src/content` remain as starter fallback content, so the
public website still works if Supabase is not configured yet.

First-time CMS setup:

1. Run the latest `supabase/schema.sql` in Supabase SQL Editor.
2. Confirm the SQL created the `tifawave-content` public Storage bucket.
3. Start the app and sign in at `/admin/login`.
4. Open `/admin/content/settings`.
5. Click **Publish Settings** to copy starter settings into Supabase.
6. Repeat for rooms, packages, gallery, FAQs, and testimonials.
7. After a section is published, edits and deletes in admin update the live website content.

Content editing notes:

- Room and package image paths should point to files under `public/images`.
- The Settings editor can upload or replace the circular logo mark without changing the fixed Tifawave wordmark text.
- The Settings editor controls the live brand palette, global booking/WhatsApp button labels, footer messaging, contact details, homepage hero, SEO, and policies.
- Admin image uploads go to Supabase Storage and automatically insert the public URL into the image field.
- Uploads accept JPG, PNG, WebP, and AVIF images up to 8 MB.
- Drag images onto an image field or use **Upload or replace**.
- Use **Feature** on room/package media or gallery items to make an image primary.
- Use up/down controls to reorder rooms, packages, galleries, FAQs, and testimonials, then **Save all**.
- Use the publish toggle on rooms and packages to hide or show them on the public website.
- List fields use one item per line.
- Image galleries use this line format: `/images/rooms/photo.webp | Alt text | Optional caption`.
- FAQ categories are selected with checkboxes.
- Public pages read Supabase content first and fall back to `src/content` only when a CMS section has not been published.

## Local Booking Test

1. Copy `.env.example` to `.env.local`.
2. Add Supabase env vars and run `supabase/schema.sql` in Supabase.
3. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Optional: add Resend env vars to test email delivery.
5. Restart the dev server:

```bash
npm run dev
```

6. Submit the public booking form at `http://localhost:3000/booking`.
7. Open `http://localhost:3000/admin/login`.
8. Log in and confirm the inquiry appears at `/admin/bookings`.

## Vercel Deployment Steps

1. Run the local production checks:

```bash
npm run lint
npm run typecheck
npm run build
```

2. Push the repository to GitHub, GitLab, or Bitbucket.
3. In Vercel, choose Add New Project and import the repository.
4. Keep the framework preset as Next.js. The default commands are correct:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: Vercel default for Next.js
5. Add every production environment variable listed in the Environment Variables section.
6. Set variables for Production and Preview if you want preview deployments to use the same Supabase/Resend setup.
7. Deploy.
8. Open the deployment URL and test `/`, `/rooms`, `/surf-packages`, `/gallery`, `/booking`, `/contact`, `/admin/login`, `/robots.txt`, and `/sitemap.xml`.
9. Submit a test booking inquiry and confirm it appears in `/admin/bookings`.
10. Watch Vercel deployment logs for missing env variables, Supabase errors, or Resend errors.

You can also use Vercel CLI from the project root:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel
vercel --prod
```

Use the dashboard flow for the first production launch unless you specifically prefer CLI deployments.

## Domain Connection Steps

1. In Vercel, open Project Settings > Domains.
2. Add the production domain, for example `tifawave.com`.
3. Add the `www` version too, for example `www.tifawave.com`.
4. Choose one canonical domain and redirect the other to it.
5. Add the DNS records Vercel shows:
   - Apex/root domain usually uses an `A` record.
   - `www` or other subdomains usually use a `CNAME` record.
6. Wait for DNS verification and SSL certificate provisioning.
7. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the final canonical URL.
8. Redeploy after changing `NEXT_PUBLIC_SITE_URL` so metadata, canonical URLs, `robots.txt`, and `sitemap.xml` use the real domain.
9. Recheck `/sitemap.xml`, `/robots.txt`, and Open Graph previews after DNS is live.

If the same domain is used for Resend, add the Resend DNS records alongside the Vercel records without deleting required existing records.

## Backup And Export Notes

Supabase is the production source of truth for website CMS content and booking inquiries.

Important tables:

- `public.booking_inquiries`: guest booking inquiries and statuses
- `public.website_content`: editable settings, rooms, packages, gallery, FAQs, and testimonials

Backup routine:

1. Check Supabase Dashboard > Database > Backups for available managed backups.
2. Export table data before major CMS edits or launch-day changes.
3. Keep a weekly off-site backup during active operations.
4. Remember that database backups include Storage metadata, but not necessarily the original uploaded Storage objects. Keep original room, package, gallery, hero, and about photos in a separate folder or cloud drive.

Manual data-only export with Supabase CLI:

```bash
supabase login
supabase db dump --db-url "YOUR_SUPABASE_CONNECTION_STRING" --data-only -f backups/tifawave-data.sql
```

Quick CSV snapshots with `psql`:

```bash
psql "YOUR_SUPABASE_CONNECTION_STRING" -c "\copy public.booking_inquiries to 'backups/booking-inquiries.csv' csv header"
psql "YOUR_SUPABASE_CONNECTION_STRING" -c "\copy public.website_content to 'backups/website-content.csv' csv header"
```

You can also export CSV files from the Supabase table editor for quick manual snapshots.

## Final Launch Checklist

1. Run `npm run lint`, `npm run typecheck`, and `npm run build` locally.
2. Confirm `.env.local` is not committed.
3. Create the production Supabase project.
4. Run `supabase/schema.sql`.
5. Confirm `booking_inquiries`, `website_content`, and `tifawave-content` exist.
6. Configure all Vercel environment variables.
7. Configure and verify the Resend sending domain.
8. Connect the production domain in Vercel.
9. Set `NEXT_PUBLIC_SITE_URL` to the final canonical domain and redeploy.
10. Replace placeholder photography with real hostel and surf imagery.
11. Publish CMS content from `/admin/content/*`.
12. Confirm rooms, surf packages, prices, contact details, policies, FAQs, testimonials, and gallery are final.
13. Submit a live test booking inquiry.
14. Confirm the inquiry appears in `/admin/bookings`.
15. Confirm status update and delete work in admin.
16. Confirm the booking email arrives when Resend is enabled.
17. Confirm WhatsApp fallback opens with the correct phone number/message.
18. Check `/robots.txt`, `/sitemap.xml`, metadata previews, and mobile layout.
19. Export a pre-launch Supabase backup or CSV snapshot.
20. Monitor Vercel function logs and Supabase logs during the first real inquiries.

## Editable Website Content

The public website now reads from simple TypeScript content files:

- `src/content/site.ts`: hostel name, tagline, location, address, WhatsApp, email, Instagram, Google Maps embed URL, check-in/out times, policies, and SEO keywords
- `src/content/rooms.ts`: room names, slugs, prices, capacity, amenities, photos, availability, and booking CTA text
- `src/content/packages.ts`: surf package names, slugs, prices, duration, inclusions, ideal guest type, photos, availability, and booking CTA text
- `src/content/faqs.ts`: editable FAQs plus category tags for room and package detail pages
- `src/content/testimonials.ts`: guest quotes shown on the homepage
- `src/content/gallery.ts`: gallery image entries used across the site

Core reusable UI lives in `src/components`.

### Add a New Room

1. Open `src/content/rooms.ts`.
2. Duplicate one room object inside the `rooms` array.
3. Change `id`, `name`, and `slug` so they are unique.
4. Update descriptions, `pricePerNight`, `capacity`, `bedType`, `amenities`, and image URLs.
5. Keep `available: true` if the room should appear in the booking dropdown.

The detail page is generated automatically at `/rooms/[slug]`.

### Add a New Surf Package

1. Open `src/content/packages.ts`.
2. Duplicate one package object inside `surfPackages`.
3. Change `id`, `name`, and `slug`.
4. Update `price`, `duration`, `includes`, `idealFor`, descriptions, and image URLs.
5. Keep `available: true` if it should appear in the booking dropdown.

The detail page is generated automatically at `/surf-packages/[slug]`.

### Change Prices

- Room prices: edit `pricePerNight` in `src/content/rooms.ts`.
- Surf package prices: edit `price` in `src/content/packages.ts`.

### Change WhatsApp, Email, or Hostel Details

Open `src/content/site.ts` and edit:

- `email`
- `logoImage`
- `theme`
- `uiText`
- `whatsapp.display`
- `whatsapp.e164`
- `whatsapp.defaultMessage`
- `address`
- `googleMapsEmbedUrl`
- `checkInTime`
- `checkOutTime`
- `policies`
- `seoKeywords`

### Update Gallery Images

Open `src/content/gallery.ts` and edit each item’s:

- `src`
- `alt`
- `category`

The homepage gallery preview and `/gallery` page update automatically.

## Photo Folders

The site is now prepared for real local property photography:

- `public/images/hero`
- `public/images/about`
- `public/images/rooms`
- `public/images/packages`
- `public/images/gallery`

Temporary SVG placeholders already live in those folders so the layout stays intact until final photos are ready.

Real stock photos are included for non-hostel imagery:

- Hero surf coastline: `public/images/hero/hero-atlantic-surf-morocco.jpg`
- About/coast atmosphere: `public/images/about/about-morocco-surf-coast.jpg`
- Surf package imagery: `public/images/packages/*.jpg`
- Brand logo asset: `public/images/brand/tifawave-logo.svg`
- Browser icon asset: `src/app/icon.svg`

Room photos and main gallery/property photos are still placeholders on purpose. Replace those with real Tifawave hostel photos before launch so guests see the actual rooms, terrace, common areas, and property details they are booking.

### Where To Upload Real Photos

- Hero homepage image: `public/images/hero`
- About or property atmosphere images: `public/images/about`
- Room photos: `public/images/rooms`
- Surf package photos: `public/images/packages`
- General gallery photos: `public/images/gallery`

### Recommended Photo Specs

- Hero images: around `2400 x 1500`
- Room and package images: around `1600 x 1200`
- Gallery images: around `1600 x 1200` or larger
- Preferred format: `webp` or high-quality `jpg`
- Use descriptive lowercase filenames with hyphens, for example `private-double-window.webp`

### Replace Images Without Breaking The Site

1. Add the new photo file to the correct folder under `public/images`.
2. Open the matching content file in `src/content`.
3. Replace only the `src` value, keeping the path rooted at `/images/...`.
4. Keep `alt` text descriptive so SEO and accessibility stay strong.

Example:

```ts
featuredImage: {
  src: "/images/rooms/private-double-window.webp",
  alt: "Private double room with warm afternoon light",
}
```

If a photo path is wrong or a file goes missing, the UI now falls back to a designed placeholder panel instead of leaving a broken image area.

### Update FAQs

Open `src/content/faqs.ts` and edit, add, or remove FAQ objects.

- `question` is the visible prompt.
- `answer` is the reply shown to guests.
- `categories` controls where the FAQ appears. Use `general`, `rooms`, `packages`, or `booking`.

Room detail pages automatically show FAQs tagged with `rooms`. Surf package detail pages automatically show FAQs tagged with `packages`.

### Update Testimonials

Open `src/content/testimonials.ts` and edit each testimonial object:

- `quote`
- `name`
- `detail`

These testimonials populate the homepage trust section automatically.

### What Updates Automatically

- New room entries create `/rooms/[slug]` detail pages.
- New surf package entries create `/surf-packages/[slug]` detail pages.
- Available rooms and packages flow into the booking dropdowns.
- Sitemap entries are generated for all room and surf package detail pages.
