# Google Ads + SEO — Handoff

Branch: `feature/ads-seo-readiness`
Date: 2026-04-30

This document lists exactly what was changed in code, what you (Anes) still need
to do before launching Google Ads, and what's nice-to-have later.

---

## 1. What I changed (already done in this branch)

### Tracking / Ads
- **Single gtag loader** for both GA4 and Google Ads in [index.html](index.html). Previously the gtag script was loaded twice with two `dataLayer`/`gtag` blocks — now one loader, two `gtag('config', …)` calls. Same behavior, half the requests.
- **Google Ads conversion firing** wired up on `/merci` ([src/pages/ThankYouPage.tsx](src/pages/ThankYouPage.tsx)).
  - Fires `gtag('event', 'conversion', { send_to, value, currency, transaction_id })` once booking data is loaded.
  - Guarded so reloads of `/merci?ref=…` don't double-count.
  - **The `send_to` value is empty on purpose — see "What you must do" below.**
- **Enhanced Conversions** prepared on `/merci`: `gtag('set', 'user_data', { email, phone_number })` is called before the conversion fires, so once you enable Enhanced Conversions in the Ads UI you'll get higher match rates automatically. The ThankYou page now also pulls `email` and `phone` from the bookings table.

### SEO
- **Meta tags overhaul** in [index.html](index.html): real `<title>`, real `<meta name="description">`, full Open Graph set, full Twitter Card set, canonical, theme-color, robots.
- **Favicon**: replaced the default Vite SVG with the actual logo at [public/favicon.png](public/favicon.png) (copied from `src/assets/123.png`).
- **Structured data** (JSON-LD) injected in [index.html](index.html):
  - `AutoRental` / LocalBusiness schema with name, address (Oran, DZ), phone, email, hours, social links.
  - `FAQPage` schema mirroring all 6 FAQs from [src/components/FAQ.tsx](src/components/FAQ.tsx).
- **Per-route SEO hook** at [src/lib/seo.ts](src/lib/seo.ts). Sets title, description, canonical, OG, Twitter on every route. Used in:
  - HomePage — [src/App.tsx](src/App.tsx)
  - [src/pages/BookingPage.tsx](src/pages/BookingPage.tsx)
  - [src/pages/FleetPage.tsx](src/pages/FleetPage.tsx)
  - [src/pages/ConditionsPage.tsx](src/pages/ConditionsPage.tsx)
  - [src/pages/ThankYouPage.tsx](src/pages/ThankYouPage.tsx) (with `noindex`)
  - [src/pages/PrivacyPolicyPage.tsx](src/pages/PrivacyPolicyPage.tsx)
- **`robots.txt`** at [public/robots.txt](public/robots.txt) — disallows `/admin*`, points to sitemap.
- **`sitemap.xml`** at [public/sitemap.xml](public/sitemap.xml) — lists 5 public routes.
- **Privacy Policy page** at `/politique-confidentialite` ([src/pages/PrivacyPolicyPage.tsx](src/pages/PrivacyPolicyPage.tsx)) — required by Google Ads policy.
- **Footer link** to the privacy policy ([src/components/Footer.tsx](src/components/Footer.tsx)).

### Verification
- `npx tsc -b` passes (exit 0). No type errors introduced.
- No production dependency added.

---

## 2. What YOU must do before turning ads on (blocking)

### A. Get the Google Ads conversion label and paste it in
This is the single most important blocker. Without it, Google Ads has **no idea**
when a booking happens, and Smart Bidding cannot work.

1. In Google Ads → **Tools & Settings → Conversions**.
2. Either select an existing "Booking" / "Lead" / "Purchase" action, or **create a new one**:
   - Goal: **Submit lead form** (or **Purchase** if you want to optimize on revenue and you treat the booking as a sale).
   - Conversion name: e.g. `Booking submitted`.
   - Value: **Use different values for each conversion** (we send `value` per booking).
   - Count: **One** (one conversion per click).
   - Click-through window: 30 days.
   - Attribution: Data-driven.
3. In the action's **Tag setup**, choose **Use Google tag → Use existing tag**, then copy the snippet that looks like:
   ```js
   gtag('event', 'conversion', { 'send_to': 'AW-17780680945/XXXXXXXXXXX', ... })
   ```
4. Open [src/pages/ThankYouPage.tsx](src/pages/ThankYouPage.tsx) and replace:
   ```ts
   const GOOGLE_ADS_CONVERSION_SEND_TO = '';
   ```
   with the full `'AW-17780680945/XXXXXXXXXXX'` string.
5. Deploy. Then in the same Conversion action, click **Tag diagnostics** and confirm
   "Recording conversions" within 24 h after a real test booking.

### B. Turn on Enhanced Conversions in the Ads UI
The code already pushes `email` and `phone` via `gtag('set', 'user_data', …)`.
You just need to flip the switch in the UI:

1. Google Ads → **Tools & Settings → Conversions** → click the conversion action.
2. Open **Enhanced conversions** section → **Turn on**.
3. Method: **Google tag**.
4. URL: your domain.
5. Save. Match rate will start showing within ~24–48 h after the first conversions.

### C. Update the production domain in 4 files
I used `https://www.happydayslocation.com` as a placeholder. If your real domain
differs, search-and-replace it in:
- [index.html](index.html) (canonical, OG URL, JSON-LD `url`, `logo`, `image`)
- [public/robots.txt](public/robots.txt) (sitemap line)
- [public/sitemap.xml](public/sitemap.xml) (5 `<loc>` entries)
- [src/lib/seo.ts](src/lib/seo.ts) (`SITE_URL` constant — line ~12)

### D. Verify ownership and submit the sitemap
1. Add the site to **Google Search Console** (https://search.google.com/search-console).
2. Verify ownership (the GA4 tag already on the site is the easiest way: choose "Google Analytics" verification).
3. **Sitemaps → Add a new sitemap → `sitemap.xml`** → Submit.
4. Repeat in **Bing Webmaster Tools** (free, takes 5 min, gives you Bing + DuckDuckGo).

### E. Link Google Ads ↔ GA4
In Google Ads → **Tools & Settings → Linked accounts → Google Analytics (GA4)** →
link `G-J16KF425BN`. This unlocks remarketing audiences and lets you import GA4
events as backup conversions.

### F. Privacy Policy review
I wrote [src/pages/PrivacyPolicyPage.tsx](src/pages/PrivacyPolicyPage.tsx) with
sensible defaults. **Read it once** and tweak the address/contact section, the
3-year retention period, and the data-sharing list to match your actual practice.
Date stamp: "avril 2026".

---

## 3. Strongly recommended (do within first week of running ads)

### G. Cookie consent banner + Consent Mode v2
Required if you advertise to EU/EEA users. Without it, Google will progressively
throttle conversions for non-consented users.

- Easiest path: install **Cookiebot**, **Axeptio**, or **Iubenda** free tier; they
  handle Consent Mode v2 wiring automatically.
- Or DIY: add a banner that calls `gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' })` on accept, and set the default to `'denied'` in the `<head>` before the gtag config.

### H. Server-side conversions backup (Google Ads "Conversions API equivalent")
The current setup is client-side only. If a user blocks gtag with an ad-blocker,
the conversion is lost. To recover those:
- Use **Google Ads Conversion Linker via GTM Server-side**, or
- Send conversions via the **Google Ads Offline Conversion Import API** from your
  Supabase Edge Function ([supabase/functions/](supabase/functions/)) using the
  stored `gclid` (already captured by [src/lib/utmTracking.ts](src/lib/utmTracking.ts)).
- This typically recovers 10–25% of "lost" conversions.

### I. Page speed pass before scaling spend
Run [PageSpeed Insights](https://pagespeed.web.dev/) on the live site. Targets:
- LCP < 2.5 s
- CLS < 0.1
- INP < 200 ms

Likely wins:
- The hero background image at `src/assets/photo-1656978310683-d415ee895c2c.jpg` is bundled. Convert to WebP/AVIF and consider serving from `public/` with a `<link rel="preload" as="image">`.
- Vehicle images in `public/vehicles/*` may be unoptimized — run them through Squoosh or `sharp` to get them under 150 KB each.
- Add `loading="lazy"` to below-the-fold images.

### J. Per-vehicle landing pages (huge SEO + ads win)
Right now `/fleet` is one big page. Long-tail searches like "louer Renault Clio 5 Oran" can't land on a dedicated page. Consider adding:
- Route `/fleet/:slug` with one page per vehicle.
- Add `Vehicle` JSON-LD per page with price, features, image.
- Update [public/sitemap.xml](public/sitemap.xml) to include all 20 vehicle URLs.

This will roughly **double** your organic traffic ceiling and let you run super-targeted Google Ads campaigns with one ad group per vehicle.

### K. Pre-render or migrate to Next.js
This is a Vite SPA. Googlebot does render JS, but it's slower and less reliable
than HTML. For a rentals site competing on local searches, pre-rendered HTML is a
clear ranking advantage. Lightest option: `vite-plugin-prerender` or `react-snap`.
Heavier but better long-term: migrate to Next.js.

---

## 4. Optional / later

- **Bing Ads / Microsoft Advertising** — same setup as Google Ads with a UET tag.
- **Call tracking** — your phone number `+213 559 599 955` is plain text. With a
  call tracking provider (CallRail, etc.) you can attribute phone calls to ad
  campaigns and import them as conversions.
- **Meta CAPI** (server-side Pixel) — same idea as Enhanced Conversions but for
  Meta. Would require a Supabase Edge Function calling the Meta Conversions API
  with the stored `fbclid`.
- **hreflang** — only relevant if you start serving English/Arabic versions.
- **Schema.org `BreadcrumbList`** — small SEO gain on the booking flow.
- **PWA / web manifest** — not blocking for ads, but improves the "Add to home
  screen" experience.

---

## 5. Quick test plan after deploy

1. Deploy this branch.
2. Open the site, view source, confirm `<title>`, `<meta description>`, OG tags, JSON-LD all present.
3. `https://yourdomain.com/robots.txt` → should serve.
4. `https://yourdomain.com/sitemap.xml` → should serve.
5. Test the [Rich Results Test](https://search.google.com/test/rich-results) on the homepage — should detect `AutoRental` and `FAQPage`.
6. Make a real test booking → land on `/merci`.
7. Open Chrome DevTools → Network → filter `google` → confirm a `collect?…&t=event&en=conversion` request fires (or use the **Google Tag Assistant** Chrome extension).
8. After 24 h, check **Google Ads → Conversions → Tag diagnostics** says "Recording conversions".

---

## 6. Files changed in this branch

```
modified:   index.html
modified:   src/App.tsx
modified:   src/components/Footer.tsx
modified:   src/pages/BookingPage.tsx
modified:   src/pages/ConditionsPage.tsx
modified:   src/pages/FleetPage.tsx
modified:   src/pages/ThankYouPage.tsx
new file:   ADS_SEO_HANDOFF.md
new file:   public/favicon.png
new file:   public/robots.txt
new file:   public/sitemap.xml
new file:   src/lib/seo.ts
new file:   src/pages/PrivacyPolicyPage.tsx
```

---

## TL;DR — minimum to launch ads

1. Paste the conversion label in [src/pages/ThankYouPage.tsx](src/pages/ThankYouPage.tsx) (`GOOGLE_ADS_CONVERSION_SEND_TO`). **Blocker.**
2. Replace `https://www.happydayslocation.com` with your real domain in 4 files.
3. Turn on Enhanced Conversions in the Ads UI.
4. Submit `sitemap.xml` to Search Console.
5. Read and tweak the privacy policy.
6. Add a cookie consent banner before scaling spend in EU.

Everything else can wait until ads are running.
