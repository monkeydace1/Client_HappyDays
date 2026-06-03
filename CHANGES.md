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

## Workflow

1. Pick the next item.
2. Investigate first, confirm understanding with user.
3. Implement on `feature/changementavril1`.
4. User tests locally.
5. Check the box and move to the next.
