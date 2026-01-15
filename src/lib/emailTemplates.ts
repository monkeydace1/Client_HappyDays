import type { BookingSubmission } from './bookingService';

/**
 * Generate customer confirmation email HTML
 */
export function generateCustomerEmailHTML(
  bookingReference: string,
  submission: BookingSubmission
): string {
  const { clientInfo, selectedVehicle, departureDate, returnDate, rentalDays, totalPrice } = submission;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande de réservation reçue</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📋 Réservation en traitement</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Merci pour votre confiance</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Greeting -->
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Bonjour <strong>${clientInfo.firstName} ${clientInfo.lastName}</strong>,
              </p>

              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Nous avons bien reçu votre demande de réservation. Notre équipe va vérifier la disponibilité et vous contactera très prochainement pour confirmer votre réservation.
              </p>

              <!-- Booking Reference -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #666666;">Référence de réservation</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0ea5e9; font-family: 'Courier New', monospace;">${bookingReference}</p>
                  </td>
                </tr>
              </table>

              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 18px; color: #333333;">Détails de votre réservation</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">📅 Dates :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
                    Du ${new Date(departureDate).toLocaleDateString('fr-FR')} au ${new Date(returnDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">⏱️ Durée :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">${rentalDays} jour(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">🚗 Véhicule :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">${selectedVehicle.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">📍 Prise en charge :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">${submission.pickupLocation}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 15px; border-top: 1px solid #e2e8f0; margin-top: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #333333; font-size: 16px; font-weight: bold;">Total :</td>
                        <td align="right" style="padding: 8px 0; color: #0ea5e9; font-size: 24px; font-weight: bold;">${totalPrice}€</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1e40af;">📋 Prochaines étapes</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                      <li>Notre équipe va vérifier la disponibilité</li>
                      <li>Vous recevrez une confirmation par WhatsApp ou téléphone sous 24h</li>
                      <li>Conservez votre référence de réservation : <strong>${bookingReference}</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 0; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">Besoin d'aide ?</p>
                    <a href="https://wa.me/213559599955" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                      💬 WhatsApp
                    </a>
                    <a href="tel:+213559599955" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      📞 Appeler
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #333333;">Happy Days Location</p>
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">Location de voitures - Oran, Algérie</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">
                <a href="tel:+213559599955" style="color: #0ea5e9; text-decoration: none;">+213 559 599 955</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate admin notification email HTML
 */
export function generateAdminEmailHTML(
  bookingReference: string,
  submission: BookingSubmission
): string {
  const { clientInfo, selectedVehicle, departureDate, returnDate, rentalDays, totalPrice, supplements, additionalDriver } = submission;

  const supplementsList = supplements.length > 0
    ? supplements.map(s => `<li>${s.name} (x${s.quantity || 1}): ${s.pricePerDay * (s.quantity || 1)}€/jour</li>`).join('')
    : '<li>Aucun supplément</li>';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 NOUVELLE RÉSERVATION</h1>
              <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 18px; font-family: 'Courier New', monospace; font-weight: bold;">${bookingReference}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">

              <!-- Client Info -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">👤 Informations client</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="30%" style="color: #666666; font-size: 14px;">Nom complet :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${clientInfo.firstName} ${clientInfo.lastName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Email :</td>
                  <td style="color: #333333; font-size: 14px;"><a href="mailto:${clientInfo.email}" style="color: #0ea5e9; text-decoration: none;">${clientInfo.email}</a></td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Téléphone :</td>
                  <td style="color: #333333; font-size: 14px;"><a href="tel:${clientInfo.phone}" style="color: #0ea5e9; text-decoration: none;">${clientInfo.phone}</a></td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Pays :</td>
                  <td style="color: #333333; font-size: 14px;">${clientInfo.country}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Ville :</td>
                  <td style="color: #333333; font-size: 14px;">${clientInfo.city}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Permis N° :</td>
                  <td style="color: #333333; font-size: 14px;">${clientInfo.driverLicense.documentNumber}</td>
                </tr>
              </table>

              <!-- Booking Details -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">📅 Détails de la réservation</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="30%" style="color: #666666; font-size: 14px;">Dates :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">
                    ${new Date(departureDate).toLocaleDateString('fr-FR')} → ${new Date(returnDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Durée :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${rentalDays} jour(s)</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Véhicule :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.category})</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Prise en charge :</td>
                  <td style="color: #333333; font-size: 14px;">${submission.pickupLocation}${submission.customPickupLocation ? ` - ${submission.customPickupLocation}` : ''}</td>
                </tr>
                ${submission.differentReturnLocation ? `
                <tr>
                  <td style="color: #666666; font-size: 14px;">Retour :</td>
                  <td style="color: #333333; font-size: 14px;">${submission.returnLocation}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #666666; font-size: 14px;">Mode de paiement :</td>
                  <td style="color: #333333; font-size: 14px;">${clientInfo.paymentMethod === 'cash' ? '💵 Espèces' : '💳 Carte bancaire'}</td>
                </tr>
              </table>

              <!-- Supplements -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">🎁 Suppléments</h2>
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                ${supplementsList}
                ${additionalDriver ? '<li><strong>Conducteur additionnel : 8€/jour</strong></li>' : ''}
              </ul>

              <!-- Pricing -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Véhicule (${rentalDays} jours × ${selectedVehicle.pricePerDay}€) :</td>
                        <td align="right" style="color: #333333; font-size: 14px;">${selectedVehicle.pricePerDay * rentalDays}€</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Suppléments :</td>
                        <td align="right" style="color: #333333; font-size: 14px;">${submission.supplementsTotal}€</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px;"></td>
                      </tr>
                      <tr>
                        <td style="color: #333333; font-size: 18px; font-weight: bold;">TOTAL :</td>
                        <td align="right" style="color: #0ea5e9; font-size: 24px; font-weight: bold;">${totalPrice}€</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${clientInfo.extraInformation ? `
              <!-- Additional Info -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">📝 Informations supplémentaires</h2>
              <p style="margin: 0 0 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; color: #78350f; font-size: 14px; border-radius: 4px;">
                ${clientInfo.extraInformation}
              </p>
              ` : ''}

              <!-- Action Buttons -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #1e40af; font-weight: bold;">⚡ Actions rapides</p>
                    <a href="https://wa.me/${clientInfo.phone.replace(/\D/g, '')}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 5px;">
                      💬 Contacter client
                    </a>
                    <a href="https://www.happydayslocation.com/admin/dashboard" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 5px;">
                      📊 Voir dans admin
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Notification automatique - Happy Days Location<br>
                Réservation effectuée le ${new Date().toLocaleString('fr-FR')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Manual booking data interface (for walk-in/phone bookings)
 */
export interface ManualBookingData {
  bookingReference: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  vehicleName: string;
  departureDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  rentalDays: number;
  totalPrice: number;
}

/**
 * Generate customer email HTML for manual bookings
 */
export function generateManualBookingCustomerEmailHTML(data: ManualBookingData): string {
  const firstName = data.clientName.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande de réservation reçue</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📋 Réservation en traitement</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Merci pour votre confiance</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Greeting -->
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Bonjour <strong>${firstName}</strong>,
              </p>

              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Nous avons bien enregistré votre réservation. Notre équipe va la traiter et vous contactera très prochainement pour finaliser les détails.
              </p>

              <!-- Booking Reference -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #666666;">Référence de réservation</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0ea5e9; font-family: 'Courier New', monospace;">${data.bookingReference}</p>
                  </td>
                </tr>
              </table>

              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 18px; color: #333333;">Détails de votre réservation</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">📅 Dates :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
                    Du ${new Date(data.departureDate).toLocaleDateString('fr-FR')} au ${new Date(data.returnDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">⏱️ Durée :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">${data.rentalDays} jour(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">🚗 Véhicule :</td>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">${data.vehicleName}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 15px; border-top: 1px solid #e2e8f0; margin-top: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #333333; font-size: 16px; font-weight: bold;">Total :</td>
                        <td align="right" style="padding: 8px 0; color: #0ea5e9; font-size: 24px; font-weight: bold;">${data.totalPrice}€</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1e40af;">📋 Prochaines étapes</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                      <li>Notre équipe va vérifier la disponibilité</li>
                      <li>Vous recevrez une confirmation par téléphone sous 24h</li>
                      <li>Conservez votre référence de réservation : <strong>${data.bookingReference}</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 0; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">Besoin d'aide ?</p>
                    <a href="https://wa.me/213559599955" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                      💬 WhatsApp
                    </a>
                    <a href="tel:+213559599955" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      📞 Appeler
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #333333;">Happy Days Location</p>
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">Location de voitures - Oran, Algérie</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">
                <a href="tel:+213559599955" style="color: #0ea5e9; text-decoration: none;">+213 559 599 955</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate admin notification email HTML for manual bookings
 */
export function generateManualBookingAdminEmailHTML(data: ManualBookingData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle réservation manuelle</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📝 RÉSERVATION MANUELLE</h1>
              <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 18px; font-family: 'Courier New', monospace; font-weight: bold;">${data.bookingReference}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">

              <!-- Client Info -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">👤 Informations client</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="30%" style="color: #666666; font-size: 14px;">Nom :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${data.clientName}</td>
                </tr>
                ${data.clientPhone ? `
                <tr>
                  <td style="color: #666666; font-size: 14px;">Téléphone :</td>
                  <td style="color: #333333; font-size: 14px;"><a href="tel:${data.clientPhone}" style="color: #7c3aed; text-decoration: none;">${data.clientPhone}</a></td>
                </tr>
                ` : ''}
                ${data.clientEmail ? `
                <tr>
                  <td style="color: #666666; font-size: 14px;">Email :</td>
                  <td style="color: #333333; font-size: 14px;"><a href="mailto:${data.clientEmail}" style="color: #7c3aed; text-decoration: none;">${data.clientEmail}</a></td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #666666; font-size: 14px;">Source :</td>
                  <td style="color: #333333; font-size: 14px;">📞 Réservation manuelle (téléphone/walk-in)</td>
                </tr>
              </table>

              <!-- Booking Details -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">📅 Détails de la réservation</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="30%" style="color: #666666; font-size: 14px;">Dates :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">
                    ${new Date(data.departureDate).toLocaleDateString('fr-FR')} → ${new Date(data.returnDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Durée :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${data.rentalDays} jour(s)</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">Véhicule :</td>
                  <td style="color: #333333; font-size: 14px; font-weight: 600;">${data.vehicleName}</td>
                </tr>
              </table>

              <!-- Pricing -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #333333; font-size: 18px; font-weight: bold;">TOTAL :</td>
                        <td align="right" style="color: #7c3aed; font-size: 24px; font-weight: bold;">${data.totalPrice}€</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #ede9fe; border-radius: 8px;">
                <tr>
                  <td align="center">
                    <a href="https://www.happydayslocation.com/admin/dashboard" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      📊 Voir dans admin
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Notification automatique - Happy Days Location<br>
                Réservation créée le ${new Date().toLocaleString('fr-FR')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
