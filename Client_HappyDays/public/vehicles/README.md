# Vehicle Images

Each vehicle has a folder with `main.jpg` (card on the site, thumbnail in the admin) and optional `1.jpg`, `2.jpg`, … (gallery carousel on the site).

## Image requirements

- **Format**: JPG (convert PNG / HEIC first)
- **Ratio**: 4:3 — the cards use `aspect-[4/3]` + `object-cover`, anything else gets cropped
- **Size**: ≤ 1200×900 px, ≈ 100–250 kB (JPEG quality ~82, metadata stripped)
- **Naming**: `main.jpg` = front view; `1.jpg`, `2.jpg`… = other views
- **Replacing photos**: use a **new folder name** and update the path in `src/data/vehicleData.ts` **and** the `vehicles.image` column, so no browser / CDN cache can keep serving the old picture

## Where the data lives

| What | Where |
|---|---|
| Site cards, booking step 2, admin dropdowns | `src/data/vehicleData.ts` |
| Admin grid, QuickAdd, maintenance / hidden filter | `vehicles` table in Supabase — see `supabase/migrations/009_fleet_update_oct2026.sql` for the pattern |

Both must be updated together when a vehicle is added, replaced or re-priced.

## Fleet (22 vehicles)

| ID | Folder | Car | Price |
|----|--------|-----|-------|
| 1 | fiat-500x | Fiat 500X 2024 | 45€ |
| 2 | renault-clio5 | Renault Clio 5 2022 | 35€ |
| 3 | peugeot-208 | Peugeot 208 2022 | 35€ |
| 4 | seat-ibiza-2019-auto | Seat Ibiza 2019 (Auto) | 35€ |
| 5 | seat-ibiza-fr | Seat Ibiza FR 2019 | 35€ |
| 6 | suzuki-swift | Suzuki Swift 2022 | 30€ |
| 7 | vw-polo-2019 | VW Polo Star Plus 2019 | 32€ |
| 8 | renault-clio4-limited | Clio 4 Limited 2019 | 32€ |
| 9 | seat-ibiza-style | Seat Ibiza Style 2018 | 30€ |
| 10 | fiat-500-dolcevita | Fiat 500 Dolce Vita 2025 | 30€ |
| 11 | livan-x3-pro-gris | Livan X3 Pro Gris 2025 — replaced the Toyota Yaris (Oct 2026) | 35€ |
| 12 | renault-symbol | Renault Symbol 2018 | 26€ |
| 13 | seat-ibiza-sol | Seat Ibiza Sol 2017 | 27€ |
| 14 | kia-picanto | Kia Picanto 2019 | 25€ |
| 15 | vw-polo-carat | VW Polo Carat 2016 | 28€ |
| 16 | seat-arona | Seat Arona 2019 — new photos (Oct 2026) | 36€ |
| 17 | renault-clio4-2013 | Renault Clio 4 2013 | 22€ |
| 18 | nissan-micra | Nissan Micra 2015 | 20€ |
| 19 | livan-x3-pro-noir | Livan X3 Pro Noir 2025 — replaced the Ford Fiesta (Oct 2026) | 35€ |
| 20 | renault-clio4-2016-b | Renault Clio 4 2016 | 25€ |
| 21 | seat-leon-2021 | Seat Leon 1.0 TSI 2021 — new photos, 50€ → 45€ (Oct 2026) | 45€ |
| 22 | geely-coolray | Geely Coolray 2026 | 55€ |

`renault-clio4-2016/` is no longer referenced (kept for history).
