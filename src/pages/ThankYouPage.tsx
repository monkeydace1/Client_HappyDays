import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Car, Phone, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LocationState {
  bookingReference?: string;
  clientName?: string;
  vehicleName?: string;
  departureDate?: string;
  returnDate?: string;
  totalPrice?: number;
}

export const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState;

  const [bookingData, setBookingData] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);

  // Get booking reference from URL param or state
  const refFromUrl = searchParams.get('ref');
  const bookingReference = state?.bookingReference || refFromUrl;

  // Fetch booking details if we only have the reference from URL
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingReference) {
        navigate('/', { replace: true });
        return;
      }

      // If we have state, use it
      if (state?.bookingReference) {
        setBookingData(state);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from database using the reference
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_reference', bookingReference)
          .single();

        if (error || !data) {
          console.error('Error fetching booking:', error);
          navigate('/', { replace: true });
          return;
        }

        setBookingData({
          bookingReference: data.booking_reference,
          clientName: `${data.first_name} ${data.last_name}`,
          vehicleName: data.vehicle_name,
          departureDate: data.departure_date,
          returnDate: data.return_date,
          totalPrice: data.total_price,
        });
      } catch (error) {
        console.error('Error:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingReference, state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-32 md:pt-36 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-32 md:pt-36 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <CheckCircle className="w-20 h-20 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Merci pour votre réservation !
            </h1>
            <p className="text-green-100 text-lg">
              Votre demande a été envoyée avec succès
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-8 space-y-6">
            {/* Booking Reference */}
            <div className="bg-primary-light border-l-4 border-primary p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Référence de réservation</p>
              <p className="text-2xl font-bold text-primary font-mono">{bookingData.bookingReference}</p>
            </div>

            <div className="text-gray-700 space-y-4">
              <p className="text-lg">
                Bonjour <span className="font-semibold text-primary">{bookingData.clientName}</span>,
              </p>
              <p>
                Nous avons bien reçu votre demande de réservation pour le véhicule{' '}
                <span className="font-semibold">{bookingData.vehicleName}</span>.
              </p>
            </div>

            {/* Booking Summary */}
            {bookingData.departureDate && bookingData.returnDate && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>
                    Du {new Date(bookingData.departureDate).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(bookingData.returnDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Car className="w-5 h-5 text-primary" />
                  <span>{bookingData.vehicleName}</span>
                </div>
                {bookingData.totalPrice && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-2xl font-bold text-primary">{bookingData.totalPrice}€</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">Prochaines étapes</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Notre équipe va vérifier la disponibilité</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Vous recevrez une confirmation par WhatsApp ou téléphone sous 24h</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Conservez votre référence de réservation</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <h3 className="font-bold text-gray-900">Besoin d'aide ?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/213559599955"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-all"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+213559599955"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </a>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Retour à l'accueil
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
