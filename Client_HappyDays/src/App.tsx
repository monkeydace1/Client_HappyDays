import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Fleet } from './components/Fleet';
import { AirportService } from './components/AirportService';
import { GoogleReviews } from './components/GoogleReviews';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { BookingPage } from './pages/BookingPage';
import { FleetPage } from './pages/FleetPage';
import { ConditionsPage } from './pages/ConditionsPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { WhatsAppButton } from './components/WhatsAppButton';
import { TopBanner } from './components/TopBanner';
import { captureUTMParams } from './lib/utmTracking';
import { useSEO } from './lib/seo';

// Admin pages are code-split: public visitors no longer download the dashboard,
// and the admin only downloads it once it navigates to /admin.
const AdminLoginPage = lazy(() =>
  import('./admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminPinPage = lazy(() =>
  import('./admin/pages/AdminPinPage').then((m) => ({ default: m.AdminPinPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

function AdminChunkFallback() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function HomePage() {
  useSEO({
    title: 'Happy Days Location — Location de voitures à Oran, Algérie',
    description:
      "Location de voitures à Oran avec livraison gratuite à l'aéroport. Citadines, SUV et automatiques à partir de 25€/jour. Réservation en ligne en 2 minutes.",
    path: '/',
  });
  return (
    <>
      <Hero />
      <Fleet />
      <Features />
      <AirportService />
      <GoogleReviews />
      <FAQ />
    </>
  );
}

// Layout wrapper that conditionally shows Navbar and Footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// Admin routes don't have the public navbar/footer
function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Capture UTM parameters on initial load and route changes
  useEffect(() => {
    captureUTMParams();
  }, [location.search]);

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Suspense fallback={<AdminChunkFallback />}>
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/pin" element={<AdminPinPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    );
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/conditions" element={<ConditionsPage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/merci" element={<ThankYouPage />} />
      </Routes>
    </PublicLayout>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;

