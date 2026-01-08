// Supabase Edge Function to send booking confirmation emails
// Triggered when admin changes status from 'pending' to 'active'

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfirmationEmailRequest {
  bookingReference: string
  customerEmail: string
  customerName: string
  vehicleName: string
  departureDate: string
  returnDate: string
  pickupTime?: string
  returnTime?: string
  pickupLocation?: string
  totalPrice: number
}

// Helper to format time to 12h AM/PM
function formatTime12h(time24: string | undefined): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

// Generate confirmation email HTML
function generateConfirmationEmailHTML(data: ConfirmationEmailRequest): string {
  const departureDate = new Date(data.departureDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const returnDate = new Date(data.returnDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pickupTimeStr = data.pickupTime ? ` à ${formatTime12h(data.pickupTime)}` : '';
  const returnTimeStr = data.returnTime ? ` à ${formatTime12h(data.returnTime)}` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Réservation Confirmée !</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                    Votre véhicule vous attend
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                    Bonjour <strong>${data.customerName}</strong>,
                  </p>
                  <p style="color: #666; font-size: 15px; margin: 0 0 25px 0;">
                    Excellente nouvelle ! Votre réservation a été confirmée. Voici les détails :
                  </p>

                  <!-- Booking Reference -->
                  <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Référence de réservation</p>
                    <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #16a34a; font-family: monospace;">${data.bookingReference}</p>
                  </div>

                  <!-- Booking Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="color: #666; font-size: 14px;">Véhicule</span>
                              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${data.vehicleName}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="color: #666; font-size: 14px;">Date de départ</span>
                              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${departureDate}${pickupTimeStr}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="color: #666; font-size: 14px;">Date de retour</span>
                              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${returnDate}${returnTimeStr}</p>
                            </td>
                          </tr>
                          ${data.pickupLocation ? `
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="color: #666; font-size: 14px;">Lieu de prise en charge</span>
                              <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold;">${data.pickupLocation}</p>
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="color: #666; font-size: 14px;">Total</span>
                              <p style="margin: 5px 0 0 0; color: #16a34a; font-size: 24px; font-weight: bold;">${data.totalPrice}€</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Important Info -->
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">Important :</p>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                      <li style="margin-bottom: 5px;">Présentez-vous avec votre permis de conduire valide</li>
                      <li style="margin-bottom: 5px;">En cas de retard, veuillez nous prévenir</li>
                      <li>Tout retard non signalé sera facturé 700 DZD/heure</li>
                    </ul>
                  </div>

                  <!-- WhatsApp Button -->
                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="https://wa.me/213559599955?text=Bonjour, ma réservation ${data.bookingReference} a été confirmée."
                       style="display: inline-block; background-color: #25d366; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Nous contacter sur WhatsApp
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1f2937; padding: 25px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                    Happy Days Location - Oran, Algérie
                  </p>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
                    +213 559 599 955 | happydayslocation@gmail.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: ConfirmationEmailRequest = await req.json()

    console.log(`Sending confirmation email for ${data.bookingReference} to ${data.customerEmail}`)

    // Generate email HTML
    const emailHTML = generateConfirmationEmailHTML(data)

    // Send confirmation email to customer
    const result = await resend.emails.send({
      from: 'Happy Days Location <contact@happydayslocation.com>',
      to: [data.customerEmail],
      subject: `✅ Réservation confirmée - ${data.bookingReference}`,
      html: emailHTML,
    })

    console.log('Confirmation email sent:', result)

    return new Response(
      JSON.stringify({
        success: true,
        emailId: result.data?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
