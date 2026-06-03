/**
 * UTM Parameter Tracking Utility
 * Captures UTM parameters from URL and persists them in localStorage
 * so they can be attached to bookings for ad attribution
 */

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;  // Google Click ID
  fbclid: string | null; // Facebook Click ID
  landing_page: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = 'happydays_utm_params';
const UTM_EXPIRY_DAYS = 30; // Keep UTM params for 30 days

/**
 * Capture UTM parameters from current URL and store them
 * Only captures if UTM params are present (doesn't overwrite with empty values)
 */
export function captureUTMParams(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);

  // Check if any UTM params exist in the URL
  const hasUTMParams =
    urlParams.has('utm_source') ||
    urlParams.has('utm_medium') ||
    urlParams.has('utm_campaign') ||
    urlParams.has('gclid') ||
    urlParams.has('fbclid');

  if (!hasUTMParams) {
    // No UTM params in URL, keep existing stored params
    return;
  }

  const utmData: UTMParams & { captured_at: number } = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
    gclid: urlParams.get('gclid'),
    fbclid: urlParams.get('fbclid'),
    landing_page: window.location.pathname,
    referrer: document.referrer || null,
    captured_at: Date.now(),
  };

  // Store in localStorage
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    console.log('[UTM Tracking] Captured UTM params:', utmData);
  } catch (error) {
    console.error('[UTM Tracking] Failed to store UTM params:', error);
  }
}

/**
 * Get stored UTM parameters
 * Returns null if no params stored or if they've expired
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as UTMParams & { captured_at: number };

    // Check if expired
    const expiryMs = UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - data.captured_at > expiryMs) {
      // Expired, clear storage
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }

    // Return without the captured_at field
    const { captured_at, ...utmParams } = data;
    return utmParams;
  } catch (error) {
    console.error('[UTM Tracking] Failed to get UTM params:', error);
    return null;
  }
}

/**
 * Clear stored UTM parameters
 * Call this after a successful booking if you don't want to attribute
 * multiple bookings to the same click
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch (error) {
    console.error('[UTM Tracking] Failed to clear UTM params:', error);
  }
}

/**
 * Get UTM params formatted for database insertion
 * Returns an object with only non-null values
 */
export function getUTMParamsForDatabase(): Partial<UTMParams> {
  const params = getStoredUTMParams();
  if (!params) return {};

  // Filter out null values
  const result: Partial<UTMParams> = {};

  if (params.utm_source) result.utm_source = params.utm_source;
  if (params.utm_medium) result.utm_medium = params.utm_medium;
  if (params.utm_campaign) result.utm_campaign = params.utm_campaign;
  if (params.utm_content) result.utm_content = params.utm_content;
  if (params.utm_term) result.utm_term = params.utm_term;
  if (params.gclid) result.gclid = params.gclid;
  if (params.fbclid) result.fbclid = params.fbclid;
  if (params.landing_page) result.landing_page = params.landing_page;
  if (params.referrer) result.referrer = params.referrer;

  return result;
}
