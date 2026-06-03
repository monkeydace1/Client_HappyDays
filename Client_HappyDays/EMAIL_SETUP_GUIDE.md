# 📧 Email Confirmation Setup Guide

This guide will help you set up automated email confirmations for your booking form using **Resend** (free tier: 3,000 emails/month).

## 🎯 What This Does

When a customer submits a booking form:
1. ✅ **Customer receives** a beautiful confirmation email with booking details
2. ✅ **You receive** a notification email with all customer and booking information
3. ✅ Both emails are sent automatically - no manual work needed!

---

## 📝 Step 1: Create Resend Account (5 minutes)

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address
4. Log in to the Resend dashboard

---

## 🔑 Step 2: Get Your API Key

1. In Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name like "Happy Days Production"
4. Select permission: **"Sending access"**
5. Click **"Add"**
6. **Copy the API key** - you'll need it in the next step
   - ⚠️ **Important:** Save this key somewhere safe, you won't be able to see it again!

---

## 📮 Step 3: Configure Your Sending Domain (Optional but Recommended)

### Option A: Use Resend's Test Domain (Quick Start)
- Resend provides a test domain `onboarding@resend.dev`
- You can use this immediately
- ⚠️ Emails might go to spam
- Good for testing

### Option B: Use Your Own Domain (Recommended for Production)
1. In Resend dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `happydayslocation.com`
4. Follow the DNS configuration instructions:
   - Add the SPF, DKIM, and DMARC records to your DNS
   - This usually takes 5-10 minutes to propagate
5. Once verified, your emails will have better deliverability!

---

## 🚀 Step 4: Deploy Supabase Edge Function

### Install Supabase CLI (if not installed)

```bash
# Windows (using npm)
npm install -g supabase

# Or using Scoop
scoop install supabase
```

### Login to Supabase

```bash
supabase login
```

### Link Your Project

```bash
cd "c:\Users\Anes_\Documents\Happydays\Client_HappyDays"
supabase link --project-ref rhozdkdwjolxcquupamt
```

### Set the Resend API Key as a Secret

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Replace `re_your_api_key_here` with the actual API key you copied from Resend.

### Deploy the Edge Function

```bash
supabase functions deploy send-booking-email
```

---

## ✉️ Step 5: Update Email Addresses

### Update Admin Email Address

Open `supabase/functions/send-booking-email/index.ts` and update line 50:

```typescript
to: ['your-actual-email@example.com'], // Replace with your business email
```

Replace with your actual email address where you want to receive booking notifications.

### Update Sender Email Address (if using custom domain)

In the same file, update lines 39 and 48:

```typescript
from: 'Happy Days Location <reservations@happydayslocation.com>',
```

Replace with your actual domain if you configured one in Step 3.

---

## 🧪 Step 6: Test the Setup

1. Go to your website: https://www.happydayslocation.com/booking
2. Fill out a test booking with your email address
3. Submit the form
4. Check both:
   - Your inbox (customer confirmation email)
   - Your business email (admin notification email)
5. **Check spam folder** if you don't see the emails

---

## 🎨 Email Templates

The email templates are located in:
- `src/lib/emailTemplates.ts`

You can customize:
- Colors and styling
- Email content and wording
- Logo (add an image URL)
- Contact information

---

## 💰 Pricing & Limits

### Resend Free Tier:
- ✅ **3,000 emails/month** (100/day)
- ✅ Perfect for small businesses
- ✅ No credit card required

### If you exceed the free tier:
- Resend Pro: $20/month for 50,000 emails
- Pay-as-you-go: $1 per 1,000 emails

For a car rental business, the free tier should be more than enough!

---

## 🔧 Troubleshooting

### Emails not sending?

1. **Check Supabase Edge Function logs:**
   ```bash
   supabase functions serve send-booking-email
   ```

2. **Check browser console** for errors after submitting a booking

3. **Verify API key is set:**
   ```bash
   supabase secrets list
   ```

### Emails going to spam?

1. Set up your own domain (Step 3, Option B)
2. Add SPF, DKIM, DMARC records correctly
3. Verify domain in Resend dashboard

### Need help?

- Resend Documentation: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

## 📊 Monitoring

### Check email delivery status:
1. Log in to Resend dashboard
2. Click **"Logs"** to see all sent emails
3. View delivery status, open rates, etc.

---

## 🎉 You're Done!

Your booking form now automatically sends:
- ✅ Professional confirmation emails to customers
- ✅ Instant notifications to you with booking details
- ✅ Beautiful HTML emails with all booking information

**Questions?** Check the Resend docs or Supabase docs linked above!
