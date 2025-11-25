import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/conditions" element={<ConditionsPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

