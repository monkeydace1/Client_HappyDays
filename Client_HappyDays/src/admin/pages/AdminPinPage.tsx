import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Delete, Check } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

// Hardcoded PIN for v1
const ADMIN_PIN = '1234';

export function AdminPinPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setPinVerified } = useAdminStore();

  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Auto-verify when 4 digits entered
  const handleDigitPress = (digit: string) => {
    if (success) return;

    const newPin = [...pin, digit];
    if (newPin.length <= 4) {
      setPin(newPin);

      if (newPin.length === 4) {
        const enteredPin = newPin.join('');
        if (enteredPin === ADMIN_PIN) {
          setSuccess(true);
          setTimeout(() => {
            setPinVerified(true);
            navigate('/admin/dashboard');
          }, 500);
        } else {
          setError(true);
          setTimeout(() => {
            setPin([]);
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !success) {
      setPin(pin.slice(0, -1));
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Code PIN</h1>
          <p className="text-white/70 mt-1 text-sm">Entrez votre code à 4 chiffres</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: pin[index] ? 1.1 : 1,
                backgroundColor: error
                  ? '#EF4444'
                  : success
                    ? '#22C55E'
                    : pin[index]
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.15 }}
              className="w-4 h-4 rounded-full"
            />
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-red-300 text-sm mb-4"
            >
              Code incorrect
            </motion.p>
          )}
        </AnimatePresence>

        {/* PIN Pad */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit, index) => {
              if (digit === '') {
                return <div key={index} />;
              }

              if (digit === 'del') {
                return (
                  <button
                    key={index}
                    onClick={handleDelete}
                    disabled={success}
                    className="h-16 rounded-xl bg-white/10 hover:bg-white/20
                             active:bg-white/30 transition-all duration-150
                             flex items-center justify-center touch-manipulation
                             disabled:opacity-50"
                  >
                    <Delete className="w-6 h-6 text-white" />
                  </button>
                );
              }

              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDigitPress(digit)}
                  disabled={success}
                  className="h-16 rounded-xl bg-white/10 hover:bg-white/20
                           active:bg-white/30 transition-all duration-150
                           text-white text-2xl font-semibold touch-manipulation
                           disabled:opacity-50"
                >
                  {digit}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Success Indicator */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-green-400"
            >
              <Check className="w-5 h-5" />
              <span>Accès autorisé</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout link */}
        <p className="text-center mt-8 text-white/60 text-sm">
          <button
            onClick={() => {
              useAdminStore.getState().logout();
              navigate('/admin/login');
            }}
            className="hover:text-white transition-colors"
          >
            ← Retour à la connexion
          </button>
        </p>
      </motion.div>
    </div>
  );
}
