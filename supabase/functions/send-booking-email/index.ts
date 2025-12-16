// Supabase Edge Function to send booking confirmation emails
// This runs server-side to keep the Resend API key secure

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingEmailRequest {
  bookingReference: string
  customerEmail: string
  customerName: string
  customerEmailHTML: string
  adminEmailHTML: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      bookingReference,
      customerEmail,
      customerName,
      customerEmailHTML,
      adminEmailHTML,
    }: BookingEmailRequest = await req.json()

    console.log(`Sending booking confirmation emails for ${bookingReference}`)

    // Email to customer
    const customerEmailResult = await resend.emails.send({
      from: 'Happy Days Location <reservations@happydayslocation.com>',
      to: [customerEmail],
      subject: `Confirmation de votre réservation ${bookingReference}`,
      html: customerEmailHTML,
    })

    console.log('Customer email sent:', customerEmailResult)

    // Email to admin/business owner
    const adminEmailResult = await resend.emails.send({
      from: 'Happy Days Location <reservations@happydayslocation.com>',
      to: ['contact@happydayslocation.com'], // Replace with your actual business email
      subject: `🚨 Nouvelle réservation ${bookingReference} - ${customerName}`,
      html: adminEmailHTML,
    })

    console.log('Admin email sent:', adminEmailResult)

    return new Response(
      JSON.stringify({
        success: true,
        customerEmailId: customerEmailResult.data?.id,
        adminEmailId: adminEmailResult.data?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending emails:', error)
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
