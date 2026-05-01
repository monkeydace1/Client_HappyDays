import { motion } from 'framer-motion';
import { useSEO } from '../lib/seo';

export const PrivacyPolicyPage = () => {
  useSEO({
    title: 'Politique de Confidentialité | Happy Days Location',
    description:
      "Politique de confidentialité de Happy Days Location : quelles données nous collectons, comment elles sont utilisées et vos droits conformément au RGPD.",
    path: '/politique-confidentialite',
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 md:p-10"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : avril 2026</p>

          <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">1. Responsable du traitement</h2>
              <p>
                Happy Days Location, agence de location de voitures située à Oran, Algérie, est responsable du
                traitement des données collectées sur ce site.
              </p>
              <p className="mt-2">
                Contact : happydayslocation@gmail.com — Téléphone : +213 559 599 955
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">2. Données collectées</h2>
              <p>Lors d'une réservation, nous collectons :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nom et prénom</li>
                <li>Adresse e-mail</li>
                <li>Numéro de téléphone</li>
                <li>Dates et lieux de location</li>
                <li>Véhicule sélectionné et options</li>
              </ul>
              <p className="mt-2">
                Lors de la navigation, nous pouvons collecter automatiquement : adresse IP, type de navigateur,
                pages visitées, identifiants publicitaires (gclid, fbclid) et cookies analytiques.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">3. Finalités du traitement</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Traiter votre demande de réservation et vous contacter</li>
                <li>Vous envoyer la confirmation par e-mail</li>
                <li>Mesurer l'audience et améliorer le site (Google Analytics)</li>
                <li>Mesurer la performance de nos campagnes publicitaires (Google Ads, Meta)</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">4. Cookies et traceurs</h2>
              <p>
                Nous utilisons des cookies et des traceurs tiers de Google (Analytics, Ads) et Meta (Pixel
                Facebook) afin de mesurer et d'améliorer nos services. Vous pouvez à tout moment refuser ces
                cookies via les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">5. Durée de conservation</h2>
              <p>
                Les données de réservation sont conservées 3 ans après la fin de la prestation. Les données de
                navigation sont conservées pendant 13 mois maximum.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">6. Partage des données</h2>
              <p>
                Vos données ne sont jamais vendues. Elles peuvent être partagées avec :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Supabase (hébergement de la base de données)</li>
                <li>Resend (envoi des e-mails de confirmation)</li>
                <li>Google et Meta (mesure publicitaire — données anonymisées ou hachées)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">7. Vos droits</h2>
              <p>
                Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, d'effacement,
                d'opposition et de portabilité concernant vos données. Pour exercer ces droits, contactez-nous à :
                happydayslocation@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-semibold text-secondary mb-2">8. Modifications</h2>
              <p>
                Nous pouvons être amenés à mettre à jour cette politique. La date de dernière mise à jour figure
                en haut de cette page.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
