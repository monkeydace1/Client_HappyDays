import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Full bookings table record (all client details)
interface BookingRecord {
  id: string;
  booking_reference: string;
  status: string;
  departure_date: string;
  return_date: string;
  rental_days: number;
  pickup_location: string;
  custom_pickup_location: string | null;
  return_location: string | null;
  different_return_location: boolean;
  vehicle_id: number;
  vehicle_name: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_category: string;
  vehicle_price_per_day: number;
  supplements: unknown[];
  additional_driver: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  date_of_birth: string | null;
  license_number: string;
  license_issue_date: string | null;
  license_expiration_date: string | null;
  license_photo_url: string | null;
  extra_information: string | null;
  notes: string | null;
  payment_method: string;
  vehicle_total: number;
  supplements_total: number;
  total_price: number;
  user_agent: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: BookingRecord;
  schema: string;
  old_record: BookingRecord | null;
}

const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") || "happydays-sheets-sync@happydays-482507.iam.gserviceaccount.com";
const GOOGLE_SPREADSHEET_ID = Deno.env.get("GOOGLE_SPREADSHEET_ID") || "1se6SVUc5RDAsE-GmGnSYyqvJUJQschBbQrLbW_UWFbc";
const SHEET_NAME = Deno.env.get("GOOGLE_SHEET_NAME") || "Sheet1";

// Hardcoded key for testing - will use env var if available
const HARDCODED_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCXsF3zEbIEIR9d
DKVfnZY0ZZlIDirn2KGmRNvhgpZpfuiC55IbSG6Wbbvh9MM7lW9pGScb+RDhF4ce
pqqQYQBM21Hg/2lnhKSWDjQYrtTZVfS6eczgZMyTkqIw9+al1zDhBrt4QXwX063g
CMaAueprzK0MHdkF0q2sK0TWxdibNp+wl1S8+DgYs6hz0no5m7SBU1T1mlYcl0Cg
fDjHT4wJOK8vP5EQ6ocXTUxO5JzoTsJTToL99IPTdCPkjglV5UC+45EUqWGMTGHu
xzAt3HNB6n5YHs9/OfZCdJNcD8vhT71YFI7vAIaErFdpQk64HYUULGJUPDBWgscV
vNVfMBPNAgMBAAECggEABMSab2WC/vY7kiUvnY3KhuMaqlUnrBn3Gs7XSoNcTvya
OmMlCI6CS2Avo66Z5GmSEu+jdxGhIjInISOEAP3LkJ7kN/pPSd21frH7mTsFnb9B
7gqeEf+ZHpphVsC0E0psUuZvRhxo1iblNEGSW8F8SN8qIVNe2vwAUYUaqNWXNWm5
uZj6vClubPJs5Jr3XYzKRx1ZewgGUwvWSI+dIIC3AWLmAiSoBA3ReopGM88tZ6Ck
pEdmMtsHDYZz32NI9IfWbHRkqwPp2DeNLSrrYkjqpHQ0H0EmuY3aruSngMzZCeUF
v55phZz1Mg8Fi9vo0L9Rto9TABAbOhxjlBGQ3w7igQKBgQDR1WEvJk+xZSCQSooY
djLTFGV513nZslRKtG2m+GvJr573Qmmw9ZsY249AFEttXBff778dRj3MMEz49xoa
6gWlVoOZr9UL3niDKvmehww7mb3U77rdsPR5fkJVr1suP1lckWRwPqrNaBhkt5b2
1DXLcD+bLmvuL21Q29rqhDoIWQKBgQC5EBBTrQGuLELVrAjCIlWD/CL4ZgR7Cg4a
qDeeOIpYNZLVnvVrszDq9S/J23u06mgQAaD8Dg33sWGmeT01hx1gN86tZr7aYpgL
6RKYdg+6t7pCk/nRp+x6r2aiZxHW9DkINwJ+n59wqLrFGeBypr8nwp2MEgqBgRq4
SCfj0Yv4lQKBgCFQdGaM+Zgbiyj9fKFXmsgic939VO44PuPBc6tPw6U4yc9N7wPW
arJuoXa2AiexuGSoZrpaHZOek4nviWh+gTj33Fr5LKT+xDlnCEyf+lQ4G4iEKzHp
V1c2sYdzGNHl4uUsfDrJ6EpGXaEX+NLlbEkJYD/eBerCAuQUk9Qp/CC5AoGAdrh6
cOOtD0pvudm6aKhUCe7nlEkGGNSzhaBixcrp3XrI7ugh82yqNiEC/lEihEZYaeRR
nUF67mrKBV0DymIak05Z9V3TlA/qEMH93vbmUldpUyrQ+hHrIC2D/y12AVr9d2qq
3AaU51YnMyjNl1+ng99S6LfuK3RiatRHWtxkGh0CgYAFFc26xbp+XKjCLKumBA2d
8pXucI+HeyNeDdTFZ0R5w9cipZJZz4hpthTN662gfo0Po21hYvKWuwEJMoJyZ6jy
qJH71/ETQx65iu6ejffOY9Znp4l13/tSaDfALeHmBfyaBk2+jCvRHI20TaaNamTo
1uBIMiBjlbb5EHWEWnPPLQ==
-----END PRIVATE KEY-----`;

/**
 * Get the private key - use hardcoded fallback if env var fails
 */
function getPrivateKey(): string {
  // Use hardcoded key directly since env var has formatting issues
  console.log("Using hardcoded private key");
  return HARDCODED_KEY;
}

// All 40 columns matching the bookings table
const SHEET_HEADERS = [
  "ID",
  "Booking Reference",
  "Status",
  "Departure Date",
  "Return Date",
  "Rental Days",
  "Pickup Location",
  "Custom Pickup Location",
  "Return Location",
  "Different Return Location",
  "Vehicle ID",
  "Vehicle Name",
  "Vehicle Brand",
  "Vehicle Model",
  "Vehicle Category",
  "Vehicle Price/Day",
  "Supplements",
  "Additional Driver",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Country",
  "City",
  "Address",
  "Date of Birth",
  "License Number",
  "License Issue Date",
  "License Expiration Date",
  "License Photo URL",
  "Extra Information",
  "Notes",
  "Payment Method",
  "Vehicle Total",
  "Supplements Total",
  "Total Price",
  "User Agent",
  "Locale",
  "Created At",
  "Updated At",
];

/**
 * Generate a Google OAuth2 access token using service account credentials
 */
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const base64url = (data: string) =>
    btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const headerB64 = base64url(JSON.stringify(header));
  const claimsB64 = base64url(JSON.stringify(claims));
  const unsignedToken = `${headerB64}.${claimsB64}`;

  const privateKey = getPrivateKey();
  const pemContents = privateKey.replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

/**
 * Format date for display in Algerian timezone
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("fr-FR", { timeZone: "Africa/Algiers" });
}

/**
 * Format supplements array to readable string
 */
function formatSupplements(supplements: unknown[]): string {
  if (!supplements || supplements.length === 0) return "";
  try {
    return supplements
      .map((s: { name?: string; quantity?: number }) => `${s.name || "?"} x${s.quantity || 1}`)
      .join(", ");
  } catch {
    return JSON.stringify(supplements);
  }
}

/**
 * Append a booking row to Google Sheets (all columns from bookings table)
 */
async function appendToSheet(booking: BookingRecord): Promise<void> {
  const accessToken = await getGoogleAccessToken();

  // Row with ALL 40 bookings table columns
  const row = [
    booking.id,
    booking.booking_reference,
    booking.status,
    booking.departure_date,
    booking.return_date,
    booking.rental_days,
    booking.pickup_location,
    booking.custom_pickup_location || "",
    booking.return_location || "",
    booking.different_return_location ? "Oui" : "Non",
    booking.vehicle_id,
    booking.vehicle_name,
    booking.vehicle_brand,
    booking.vehicle_model,
    booking.vehicle_category,
    booking.vehicle_price_per_day,
    formatSupplements(booking.supplements || []),
    booking.additional_driver ? "Oui" : "Non",
    booking.first_name,
    booking.last_name,
    booking.email,
    booking.phone,
    booking.country,
    booking.city,
    booking.address || "",
    booking.date_of_birth || "",
    booking.license_number,
    booking.license_issue_date || "",
    booking.license_expiration_date || "",
    booking.license_photo_url || "",
    booking.extra_information || "",
    booking.notes || "",
    booking.payment_method,
    booking.vehicle_total,
    booking.supplements_total,
    booking.total_price,
    booking.user_agent || "",
    booking.locale || "",
    formatDate(booking.created_at),
    formatDate(booking.updated_at),
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:AN:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Sheets API error: ${JSON.stringify(error)}`);
  }
  console.log(`Added ${booking.booking_reference} to Google Sheets`);
}

// Main HTTP handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const payload: WebhookPayload = await req.json();
    console.log(`Received ${payload.type} event for ${payload.table}`);

    // Only process bookings table events (the full client details table)
    if (payload.table !== "bookings") {
      return new Response(JSON.stringify({ message: "Ignoring non-bookings event" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle INSERT events
    if (payload.type === "INSERT" && payload.record) {
      await appendToSheet(payload.record);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
