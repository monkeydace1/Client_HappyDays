# Data Layer Documentation

## Vehicle Data (`vehicleData.ts`)

Source of truth for the public site and the admin dropdowns. The admin grid, QuickAdd and the
maintenance/hidden filter read the `vehicles` table in Supabase, which has to be kept in sync by
hand (pattern: `supabase/migrations/009_fleet_update_oct2026.sql`).

### Vehicle Object Structure
```typescript
{
  id: number,              // Unique ID (1-22)
  name: string,            // Display name
  brand: string,           // Manufacturer
  model: string,           // Model name
  year: number,            // Year
  category: string,        // SUV, Citadine, Berline, Mini
  image: string,           // Main image path
  images: string[],        // All images array
  transmission: string,    // Manuelle | Automatique
  fuel: string,            // Essence | Diesel | Hybride
  seats: number,           // 4-5
  pricePerDay: number,     // Daily price in EUR
  featured: boolean,       // Show on homepage
  features: string[]       // Feature tags
}
```

### Image Helpers
```typescript
getVehicleImage(folder)           // Returns main.jpg path
getVehicleImages(folder, count)   // Returns [main.jpg, 1.jpg, 2.jpg, ...]
```

### Adding a Vehicle
1. Add object to `vehicles` array with next available ID
2. Create image folder in `public/vehicles/{folder-name}/`
3. Set `getVehicleImages(folder, extraImageCount)`

### Categories
- SUV
- Citadine
- Berline
- Compacte
- Mini

### Price Ranges
- Économique: 0-25€
- Standard: 26-35€
- Premium: 36€+
