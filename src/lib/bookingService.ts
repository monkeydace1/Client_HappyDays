import { supabase } from './supabase';
import type { Vehicle, Supplement, ClientInfo } from '../types';
import { generateCustomerEmailHTML, generateAdminEmailHTML } from './emailTemplates';
import { getUTMParamsForDatabase, clearUTMParams } from './utmTracking';

// Types for booking submission
export interface BookingSubmission {
  // Step 1: Dates & Location
  departureDate: string;
  returnDate: string;
  rentalDays: number;
  pickupLocation: string;
  customPickupLocation?: string;
  returnLocation?: string;
  differentReturnLocation: boolean;

  // Step 2: Vehicle
  selectedVehicle: Vehicle;

  // Step 3: Supplements
  supplements: Supplement[];
  additionalDriver: boolean;

  // Step 4: Client Info
  clientInfo: ClientInfo;

  // Pricing
  vehicleTotal: number;
  supplementsTotal: number;
  totalPrice: number;
}

export interface BookingRecord {
  id: string;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  departure_date: string;
  return_date: string;
  rental_days: number;
  pickup_location: string;
  custom_pickup_location?: string;
  return_location?: string;
  different_return_location: boolean;
  vehicle_id: number;
  vehicle_name: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_category: string;
  vehicle_price_per_day: number;
  supplements: Supplement[];
  additional_driver: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  date_of_birth: string;
  license_number: string;
  license_issue_date: string;
  license_expiration_date: string;
  license_photo_url?: string;
  extra_information?: string;
  notes?: string;
  payment_method: string;
  vehicle_total: number;
  supplements_total: number;
  total_price: number;
  user_agent?: string;
  locale?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Generate a booking reference in format: HD-YYYY-MM-XXXX
 * Example: HD-2024-11-0001
 */
export async function generateBookingReference(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `HD-${year}-${month}-`;

  // Query for the latest booking reference this month
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_reference')
    .like('booking_reference', `${prefix}%`)
    .order('booking_reference', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last booking reference:', error);
    // Fallback: use timestamp-based reference
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  let sequenceNumber = 1;

  if (data && data.length > 0) {
    // Extract the sequence number from the last reference
    const lastRef = data[0].booking_reference;
    const lastSequence = parseInt(lastRef.split('-').pop() || '0', 10);
    sequenceNumber = lastSequence + 1;
  }

  return `${prefix}${String(sequenceNumber).padStart(4, '0')}`;
}

/**
 * Upload license photo to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadLicensePhoto(
  file: File,
  bookingReference: string
): Promise<string | null> {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookingReference}-license.${fileExt}`;
    const filePath = `licenses/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('license-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading license photo:', uploadError);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('license-photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadLicensePhoto:', error);
    return null;
  }
}

/**
 * Save booking to Supabase database
 */
export async function saveBooking(
  submission: BookingSubmission,
  licensePhotoUrl?: string | null
): Promise<{ success: true; data: BookingRecord } | { success: false; error: string }> {
  try {
    // Generate booking reference
    const bookingReference = await generateBookingReference();

    // Prepare the booking data for database
    const bookingData = {
      booking_reference: bookingReference,
      status: 'pending',

      // Dates & Location
      departure_date: submission.departureDate,
      return_date: submission.returnDate,
      rental_days: submission.rentalDays,
      pickup_location: submission.pickupLocation,
      custom_pickup_location: submission.customPickupLocation || null,
      return_location: submission.returnLocation || null,
      different_return_location: submission.differentReturnLocation,

      // Vehicle
      vehicle_id: submission.selectedVehicle.id,
      vehicle_name: submission.selectedVehicle.name,
      vehicle_brand: submission.selectedVehicle.brand,
      vehicle_model: submission.selectedVehicle.model,
      vehicle_category: submission.selectedVehicle.category,
      vehicle_price_per_day: submission.selectedVehicle.pricePerDay,

      // Supplements
      supplements: submission.supplements,
      additional_driver: submission.additionalDriver,

      // Client Info
      first_name: submission.clientInfo.firstName,
      last_name: submission.clientInfo.lastName,
      email: submission.clientInfo.email,
      phone: submission.clientInfo.phone,
      country: submission.clientInfo.country,
      city: submission.clientInfo.city,
      address: submission.clientInfo.address || '',
      date_of_birth: submission.clientInfo.dateOfBirth || null,

      // Driver's License
      license_number: submission.clientInfo.driverLicense.documentNumber,
      license_issue_date: submission.clientInfo.driverLicense.issueDate || null,
      license_expiration_date: submission.clientInfo.driverLicense.expirationDate || null,
      license_photo_url: licensePhotoUrl || null,

      // Additional info
      extra_information: submission.clientInfo.extraInformation || null,
      notes: submission.clientInfo.notes || null,
      payment_method: submission.clientInfo.paymentMethod,

      // Pricing
      vehicle_total: submission.vehicleTotal,
      supplements_total: submission.supplementsTotal,
      total_price: submission.totalPrice,

      // Metadata
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      locale: typeof navigator !== 'undefined' ? navigator.language : null,

      // UTM Tracking (for ad attribution)
      ...getUTMParamsForDatabase(),
    };

    // Insert into database
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Error saving booking:', error);
      return { success: false, error: error.message };
    }

    // Also sync to admin_bookings table so it appears in admin calendar
    await syncToAdminBookings(bookingReference, submission);

    // Track Meta Pixel Lead event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: submission.selectedVehicle.name,
        content_category: submission.selectedVehicle.category,
        currency: 'EUR',
        value: submission.totalPrice,
      });
    }

    // Track Google Analytics generate_lead event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_lead', {
        currency: 'EUR',
        value: submission.totalPrice,
      });

      // Also track as conversion/purchase for better reporting
      (window as any).gtag('event', 'purchase', {
        transaction_id: bookingReference,
        value: submission.totalPrice,
        currency: 'EUR',
        items: [{
          item_id: submission.selectedVehicle.id,
          item_name: submission.selectedVehicle.name,
          item_category: submission.selectedVehicle.category,
          price: submission.selectedVehicle.pricePerDay,
          quantity: submission.rentalDays
        }]
      });
    }

    // Send confirmation emails (don't wait for it, send async)
    sendBookingConfirmationEmails(bookingReference, submission).catch(err => {
      console.error('Failed to send confirmation emails:', err);
      // Don't fail the booking if email fails
    });

    // Clear UTM params after successful booking (so next booking gets fresh attribution)
    clearUTMParams();

    return { success: true, data: data as BookingRecord };
  } catch (error) {
    console.error('Error in saveBooking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extract time from ISO datetime string (e.g., "2024-12-20T10:00" -> "10:00")
 */
function extractTimeFromDateString(dateString: string): string | null {
  if (!dateString) return null;
  if (dateString.includes('T')) {
    const timePart = dateString.split('T')[1];
    // Return just HH:MM (first 5 characters)
    return timePart ? timePart.substring(0, 5) : null;
  }
  return null;
}

/**
 * Extract date from ISO datetime string (e.g., "2024-12-20T10:00" -> "2024-12-20")
 */
function extractDateFromDateString(dateString: string): string {
  if (!dateString) return dateString;
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
}

/**
 * Sync booking to admin_bookings table
 * This ensures web bookings appear in the admin calendar immediately
 */
async function syncToAdminBookings(
  bookingReference: string,
  submission: BookingSubmission
): Promise<void> {
  try {
    // Extract date and time separately from the datetime strings
    const departureDate = extractDateFromDateString(submission.departureDate);
    const returnDate = extractDateFromDateString(submission.returnDate);
    const pickupTime = extractTimeFromDateString(submission.departureDate);
    const returnTime = extractTimeFromDateString(submission.returnDate);

    const adminBookingData = {
      booking_reference: bookingReference,
      status: 'pending',
      source: 'web',
      departure_date: departureDate,
      return_date: returnDate,
      pickup_time: pickupTime,
      return_time: returnTime,
      rental_days: submission.rentalDays,
      pickup_location: submission.pickupLocation,
      vehicle_id: submission.selectedVehicle.id,
      vehicle_name: submission.selectedVehicle.name,
      assigned_vehicle_id: submission.selectedVehicle.id, // Auto-assign the selected vehicle
      client_name: `${submission.clientInfo.firstName} ${submission.clientInfo.lastName}`,
      client_phone: submission.clientInfo.phone,
      client_email: submission.clientInfo.email,
      total_price: submission.totalPrice,
    };

    const { error } = await supabase
      .from('admin_bookings')
      .insert([adminBookingData]);

    if (error) {
      // Log but don't fail the main booking
      console.error('Error syncing to admin_bookings:', error);
    }
  } catch (error) {
    console.error('Error in syncToAdminBookings:', error);
  }
}

/**
 * Format WhatsApp message with booking details
 */
export function formatWhatsAppMessage(
  bookingReference: string,
  submission: BookingSubmission
): string {
  const { clientInfo, selectedVehicle, supplements, additionalDriver, totalPrice } = submission;

  // Format dates
  const departureDate = new Date(submission.departureDate);
  const returnDate = new Date(submission.returnDate);
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  // Build supplements list
  let supplementsList = '';
  if (supplements.length > 0) {
    supplementsList = supplements
      .map((s) => `  - ${s.name} (x${s.quantity || 1}): ${s.pricePerDay * (s.quantity || 1)}€/jour`)
      .join('\n');
  }
  if (additionalDriver) {
    supplementsList += '\n  - Conducteur additionnel: 8€/jour';
  }

  const message = `
🚗 *NOUVELLE RÉSERVATION - ${bookingReference}*

📅 *PÉRIODE DE LOCATION*
Départ: ${departureDate.toLocaleDateString('fr-FR', dateOptions)}
Retour: ${returnDate.toLocaleDateString('fr-FR', dateOptions)}
Durée: ${submission.rentalDays} jour(s)

📍 *LIEU*
Prise en charge: ${submission.pickupLocation}${submission.customPickupLocation ? ` (${submission.customPickupLocation})` : ''}${submission.differentReturnLocation ? `\nRetour: ${submission.returnLocation}` : ''}

🚙 *VÉHICULE*
${selectedVehicle.name} (${selectedVehicle.category})
${selectedVehicle.pricePerDay}€/jour

${supplementsList ? `📦 *SUPPLÉMENTS*\n${supplementsList}\n` : ''}
👤 *CLIENT*
Nom: ${clientInfo.firstName} ${clientInfo.lastName}
Email: ${clientInfo.email}
Téléphone: ${clientInfo.phone}
Pays: ${clientInfo.country}
Ville: ${clientInfo.city}
Adresse: ${clientInfo.address}
Date de naissance: ${clientInfo.dateOfBirth}

🪪 *PERMIS DE CONDUIRE*
Numéro: ${clientInfo.driverLicense.documentNumber}
Date d'émission: ${clientInfo.driverLicense.issueDate}
Date d'expiration: ${clientInfo.driverLicense.expirationDate}

💳 *PAIEMENT*
Mode: ${clientInfo.paymentMethod === 'cash' ? 'Espèces' : clientInfo.paymentMethod === 'card' ? 'Carte' : 'Virement'}

${clientInfo.extraInformation ? `ℹ️ *INFORMATIONS SUPPLÉMENTAIRES*\n${clientInfo.extraInformation}\n` : ''}
${clientInfo.notes ? `📝 *NOTES*\n${clientInfo.notes}\n` : ''}
💰 *TOTAL: ${totalPrice}€*
`.trim();

  return message;
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsApp(bookingReference: string, submission: BookingSubmission): void {
  const message = formatWhatsAppMessage(bookingReference, submission);
  const phoneNumber = '213559599955'; // WhatsApp number without + or spaces
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

/**
 * Send booking confirmation emails via Supabase Edge Function
 */
/**
 * Get IDs of vehicles that are booked/active during a date range
 * Used to hide unavailable vehicles on the customer booking page
 */
export async function getBookedVehicleIds(
  departureDate: string,
  returnDate: string
): Promise<number[]> {
  try {
    // Query admin_bookings for overlapping bookings with active/pending status
    // Date overlap: booking.departure <= customer.return AND booking.return >= customer.departure
    const { data, error } = await supabase
      .from('admin_bookings')
      .select('assigned_vehicle_id, vehicle_id')
      .in('status', ['new', 'pending', 'active'])
      .lte('departure_date', returnDate)
      .gte('return_date', departureDate);

    if (error) {
      console.error('Error fetching booked vehicles:', error);
      return [];
    }

    // Collect unique vehicle IDs (either assigned or default vehicle)
    const vehicleIds = new Set<number>();
    (data || []).forEach((booking) => {
      const id = booking.assigned_vehicle_id || booking.vehicle_id;
      if (id) vehicleIds.add(id);
    });

    return Array.from(vehicleIds);
  } catch (error) {
    console.error('Error in getBookedVehicleIds:', error);
    return [];
  }
}

async function sendBookingConfirmationEmails(
  bookingReference: string,
  submission: BookingSubmission
): Promise<void> {
  try {
    // Generate email HTML templates
    const customerEmailHTML = generateCustomerEmailHTML(bookingReference, submission);
    const adminEmailHTML = generateAdminEmailHTML(bookingReference, submission);

    // Get Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    // Call Supabase Edge Function to send emails
    const response = await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        bookingReference,
        customerEmail: submission.clientInfo.email,
        customerName: `${submission.clientInfo.firstName} ${submission.clientInfo.lastName}`,
        customerEmailHTML,
        adminEmailHTML,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send emails');
    }

    const result = await response.json();
    console.log('Confirmation emails sent successfully:', result);
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    throw error;
  }
}
