import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { WhatsAppButton } from './components/WhatsAppButton';
import { TopBanner } from './components/TopBanner';

// Admin imports
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminPinPage } from './admin/pages/AdminPinPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';

function HomePage() {
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

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/pin" element={<AdminPinPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
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

