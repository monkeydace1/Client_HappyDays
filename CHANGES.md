# Happydays — Changes Tracker

Branch: `feature/changementavril1`

We work through these one at a time. Each item: investigate → implement → user tests locally → check off → move to next.

---

## 1. [x] Reservation duration & pricing: half-day / hourly rule

**Problem**
A reservation from `22 mai 09:00` to `23 mai 10:00` is currently counted as **2 days** for both the client view and the admin view. It is actually **1 day + 1 hour**. Price shown to the client and to the admin is wrong (charges 2 full days).

**New rule**
- Base unit is a full day (24h).
- Any extra hours beyond a full day are charged **3 €/hour**, up to a maximum of **10 extra hours**.
- If extra hours > 10, count it as a **full additional day** instead of charging hourly.
- Example: `22 mai 09:00 → 23 mai 10:00` = 1 day + 1 hour = `daily_rate × 1 + 3 €`.
- Example: `22 mai 09:00 → 23 mai 20:00` = 1 day + 11 hours → counts as 2 full days.

**Where it shows**
- Client-side total price (booking flow, summary).
- Admin reservation list + reservation detail.
- Anywhere "number of days" is displayed.

**Status:** done (verified by user). Centralized in `src/lib/pricing.ts`; persisted as `extra_hours` SMALLINT in DB.

---

## 2. [ ] 24-hour time format everywhere (DEFERRED)

**Problem**
Times are displayed as AM/PM (e.g. `3 PM`). Need 24h format (e.g. `15h` or `15:00`).

**Scope**
- Client-facing website (booking flow, confirmation, summary, anywhere a time is shown).
- Admin (reservation lists, detail views, forms, pickers).
- Convert all existing displayed times to the new format — needs an audit pass to make sure nothing is missed.

**Status:** not started

---

## 3. [x] Admin edit-reservation: phantom extra day in total price

**Problem**
In the admin, when editing a reservation, the **total price changes** between the non-edited view and the edit view — looks like an extra day is being added for no reason.

**To do**
- Reproduce on a known reservation.
- Identify where the calculation diverges between read view and edit view.
- Explain the root cause to the user before fixing.
- Fix so the displayed total is consistent.

Note: likely related to item 1 (date/duration math). Fix item 1 first, then re-check whether this still reproduces.

**Root cause:** `BookingDetailsModal.handleSave` and the live edit-preview did `Math.ceil(diff) + 1` while the booking-flow uses `Math.ceil(diff)` (no +1). So clicking Edit always added one day to the total. Plus the small "× N jours" label used `ceil` without `+1`, so on-screen numbers disagreed.

**Fix:** removed the `+1` in [BookingDetailsModal.tsx](Client_HappyDays/src/admin/components/calendar/BookingDetailsModal.tsx); both read and edit views now go through `computeRentalUnitsFromDateTime` from [pricing.ts](Client_HappyDays/src/lib/pricing.ts).

**Status:** done (side-effect of #1). Verified by user.

---

## 4. [x] Visual bug: yellow price text bleeding through calendar

**Problem**
When scrolling on the website, the yellow price text from the car cards shows through / overlays the calendar — a z-index / background issue on the calendar component.

**Fix:** Added `z-[100]` to the HeroDatePicker container (line 157 in HeroDatePicker.tsx) to create a high-level stacking context that ensures the calendar dropdown stays on top of all page content when open. Also added `backdrop-blur-sm` to the dropdown for better visual separation.

**Status:** done

---

## 5. [ ] Admin dashboard (and website) slow / laggy

**Problem**
Admin dashboard is slow: buttons don't respond right away, loading takes a long time. The public website is slower than it should be too. Reported by the client (iPhone, Oran) and by us.

**Investigation (2026-09-19)**
Data volume is NOT the cause. `admin_bookings` has 564 rows (320 kB), `bookings` 303 rows, `vehicles` 21. Every query runs in under 15 ms server-side (pg_stat_statements). The slowness is client-side, plus a broken realtime setup that keeps every admin tab busy in the background.

Root causes, by impact:

1. **Realtime websocket rejected in production → permanent reconnect storm.** Supabase edge logs show 790 `401 UNAUTHORIZED_INVALID_API_KEY` responses on `/realtime/v1/websocket` in 24 h, a steady ~35 attempts/minute per open admin tab, all from the live app (client's iPhones in Oran, an Android, Chrome on Windows). REST calls from the same devices succeed. Cause: the Vercel env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are stored with a trailing newline (`vercel env pull` writes them as `"...\n"`, and Vite expands that to a real newline). Browsers strip the newline from HTTP headers, so REST works, but it survives in the websocket query string (`apikey=...%0A`), so realtime fails. Verified with curl: clean key → accepted, key + `%0A` → 401. Our retry code in [adminService.ts](Client_HappyDays/src/admin/services/adminService.ts) (`subscribeToBookings` / `subscribeToVehicles`) re-subscribes every 5 s on top of realtime-js's own reconnect loop, so the tab spends its life doing TLS handshakes and logging errors.

2. **Realtime publication is empty.** The `supabase_realtime` publication contains 0 tables, so even with a valid key, `postgres_changes` on `admin_bookings` / `vehicles` delivers nothing. The admin has never received live updates in production; the client reloads the page to see new bookings.

3. **Gantt chart recomputes everything on every render.** [GanttChart.tsx](Client_HappyDays/src/admin/components/calendar/GanttChart.tsx) calls `getBookingsForCell()` for every vehicle × day cell, scanning all 564 bookings and re-parsing dates each time. Measured with the real booking count (Node, desktop, pure date math, no React): 14-day view ≈ 90 ms, 30-day ≈ 160 ms, 60-day ≈ 340 ms, 180-day ≈ 1 s per render. It re-renders on every drag-over event, every state change and every parent re-render. On a phone this is seconds of blocked main thread → "the button doesn't click".

4. **All 564 bookings are loaded and rendered.** `fetchBookings()` has no filter; 528 of the 564 are completed/cancelled. [ReservationList.tsx](Client_HappyDays/src/admin/components/reservations/ReservationList.tsx) defaults to "Tous" and renders 564 animated cards with a stagger delay of `index × 0.03 s` (the last card animates 17 s after mount), each with 5 status buttons.

5. **Everything re-renders on any change.** In [useAdminData.ts](Client_HappyDays/src/admin/hooks/useAdminData.ts) the handlers depend on `bookings`, so every update recreates every handler → GanttChart / ReservationList / modals all re-render; nothing is memoized.

6. **Website payload.** One 825 kB JS bundle (229 kB gzip) containing admin + public code (no code splitting). `public/favicon.png` is 1.6 MB, `src/assets/123.png` (logo) is 1.6 MB and loaded twice (Navbar + Footer), the hero photo is 1.6 MB. No `loading="lazy"` on any `<img>`. `getBookedVehicleIds()` in [bookingService.ts](Client_HappyDays/src/lib/bookingService.ts) runs 2 queries where 1 is needed and logs every booking to the console.

7. **Geography (structural, lower priority).** The Supabase project is in us-east-2 (Ohio); users are in Oran. Each request costs ~300 ms at the edge before any DB work (edge logs: `admin_bookings` GET avg 284 ms origin time, ~1 s as measured from the client's phone).

**Implemented (2026-09-19, on the branch, not committed)**
1. [x] [supabase.ts](Client_HappyDays/src/lib/supabase.ts): `.trim()` on the URL and anon key, so the realtime handshake works even with the newline in the env vars. **Still to do by hand:** re-enter `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard without the trailing newline (Production + Preview + Development). Not required for the fix, but cleaner.
2. [x] Realtime publication: `admin_bookings` and `vehicles` added to `supabase_realtime` (ran on the live DB, verified). Migration file: [007_enable_realtime.sql](Client_HappyDays/supabase/migrations/007_enable_realtime.sql). Revert: `ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_bookings, public.vehicles;`
3. [x] [adminService.ts](Client_HappyDays/src/admin/services/adminService.ts): manual 5 s re-subscribe loop removed; realtime-js handles reconnects with backoff.
4. [x] [GanttChart.tsx](Client_HappyDays/src/admin/components/calendar/GanttChart.tsx): bookings indexed once per (bookings, visible range) in `buildCellIndex()`; rows are memoized (`GanttRow`); drag-over only updates state when the target cell changes; drag handlers are stable through a ref. Rendering is visually identical.
5. [~] [ReservationList.tsx](Client_HappyDays/src/admin/components/reservations/ReservationList.tsx): renders 100 cards at a time with an "Afficher plus" button; stagger animation capped at the first 10 cards. The data fetch is NOT filtered (all bookings still load, so nothing disappears from the list). Revisit if the client wants a history filter.
6. [x] [useAdminData.ts](Client_HappyDays/src/admin/hooks/useAdminData.ts): handlers read data through refs, so their identity is stable and a change no longer recreates every handler. Realtime console noise reduced.
7. [x] Website: admin routes are `React.lazy` (own chunk: 105 kB; main bundle 825 → 711 kB raw, 229 → 204 kB gzip); logo 1.6 MB → 112 kB (600 px, alpha kept); favicon 1.6 MB → 88 kB (512 px); hero 1.65 MB → 336 kB (1600 px); `loading="lazy"` + `decoding="async"` on carousel and fleet images (first 4 fleet cards stay eager); duplicate debug query in `getBookedVehicleIds()` removed.
8. [ ] Region move: not done (needs a new project + data migration; decide later).

`npm run build` passes (tsc + vite). `npm run lint` reports only pre-existing errors on lines this item did not touch (`any` types in VehicleSelection / bookingService / ThankYouPage, unused vars in utmTracking / sync-to-sheets).

**How to test locally**
- `npm run dev` in `Client_HappyDays`, open `http://localhost:5173/admin` (admin / admin1, PIN 1234).
- DevTools → Network → WS: one websocket with status 101, no 401 loop. Console shows `[REALTIME] bookings channel subscribed`.
- Change a booking from another tab (public booking flow, or the Supabase table editor): it appears / updates in the admin without a reload.
- Calendar: switch to 60j / 6 mois and drag a booking along its row; it should stay smooth. Right-click status menu and empty-cell click (QuickAdd) still work.
- Réservations tab: 100 cards, "Afficher plus" at the bottom; search / filters reset the page.
- Public site: logo and hero look the same; `/fleet` images load progressively.

**Verification done from the CLI (2026-09-19)**
- Realtime end-to-end probe (Node + supabase-js, same key as the app): key with trailing newline → `CHANNEL_ERROR` then `TIMED_OUT` (= production before the fix); trimmed key → `SUBSCRIBED` in 2.3 s and received the UPDATE event for a no-op `update vehicles set notes = notes where id = 1` (only `updated_at` changed on vehicle 1).
- Gantt index vs old per-cell scan, same 564 bookings, all 5 view sizes: identical cell contents (0 mismatches). Old: 31 / 61 / 137 / 262 / 796 ms per render (7 / 14 / 30 / 60 / 180 days). New: ~5 ms once per data change, then ~0 per render.
- `npm run build` OK; eslint on the changed files shows only 5 pre-existing `any` errors in `bookingService.ts` lines not touched.
- Not yet verified: the app in a real browser (drag & drop, modals, mobile Safari). That is the local test.

**Further findings from the review (NOT fixed, decide separately)**
- Storage: `license-photos` bucket = 281 files, **631 MB, avg 2.3 MB per photo**, bucket is **public**. Project is on the Supabase **Free plan (1 GB storage)** → ~5 months of runway at current volume, then uploads fail silently (booking saved without photo). Photos are uploaded at full phone resolution with no client-side compression. 6 orphaned files. Whole DB is 14 MB (of 500 MB).
- Data: **67 web bookings in `bookings` have no `admin_bookings` row** (never visible in the admin), 37 of them in 2026; 8 are duplicates of a booking that did sync; 1 confirmed **reference collision** (`HD-2026-03-0013`: walk-in admin reference generated randomly, then the web flow generated the same one → admin insert failed). Web references are sequential from `bookings`, admin references are random 4 digits, both share one UNIQUE index.
- Data: `bookings.status` is never updated by the admin (all 237 pairs still `pending` on the web side); `bookings.departure_date` is `timestamptz` while `admin_bookings.departure_date` is `date` → 16 / 237 pairs disagree on the departure day.
- Security (blocking for anything else): admin login/PIN are hardcoded in the JS bundle, RLS is "allow all" for the public anon key on every table, and the license-photo bucket is public. Anyone can read/modify all customer data.
- Vercel: `Cache-Control: public, max-age=0, must-revalidate` on everything, including the hashed `/assets/*.js` and the vehicle images → browsers revalidate on every visit. Add `headers` in the root `vercel.json`.
- Region: Supabase is in us-east-2; REST origin time ~300 ms from Oran before any DB work. Free plan = shared Nano compute.

**Deployed 2026-09-20**
- `main` fast-forwarded to `756504a`, pushed. Vercel's GitHub integration built it but did **not** promote it; the user promoted it by hand in the dashboard. Enable "Auto-assign Custom Domains" (project Settings → Environments → Production) to avoid this on every push.
- **Incident right after promotion:** every deep URL (`/admin/login`, `/booking`, `/fleet`, …) returned 404. Cause: Git-based builds read the **root** `vercel.json`, which had the build settings but not the SPA catch-all rewrite that only lived in `Client_HappyDays/vercel.json` (used by the old CLI deploys). Fixed in `89d82d2` (rewrite + immutable cache headers for `/assets/*` in the root config), built and promoted. All routes verified 200.
- Verified in production: main bundle 711 kB, admin chunk 105 kB loaded only on `/admin`, favicon 90 kB, `.trim()` present around the inlined URL/key in the shipped JS.
- Deploy path from now on: push to `main` → Vercel builds → promote (or auto-assign). The old `npx vercel --prod --force` path only works with the Vercel account that owns the `ams-projects` team; the CLI on this PC is logged in as another account.

**Status:** live in production since 2026-09-20 ~11:40 UTC. Remaining: user re-enters the two Vercel env vars without the trailing newline (cleanup only), and the "Further findings" above are the next items.

---

## Workflow

1. Pick the next item.
2. Investigate first, confirm understanding with user.
3. Implement on `feature/changementavril1`.
4. User tests locally.
5. Check the box and move to the next.
