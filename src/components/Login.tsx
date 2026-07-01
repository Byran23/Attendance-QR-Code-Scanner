import { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, AlertCircle, ClipboardList, Loader2, WifiOff } from 'lucide-react';
import { useData } from '../DataContext';

export default function Login() {
  const { login, loadingPins, pinsError } = useData();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Apply dark mode on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pin.trim()) {
      setError('Please enter a PIN code');
      return;
    }

    setLoading(true);

    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = login(pin.trim());
    if (!success) {
      setError('Invalid PIN code');
      setPin('');
    }
    setLoading(false);
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers
    const cleaned = value.replace(/\D/g, '');
    setPin(cleaned);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <ClipboardList size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AttendEase</h1>
          <p className="text-blue-200 dark:text-slate-400 mt-1">QR Attendance Tracker</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound size={28} className="text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-1">
            Admin Access
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-center text-sm mb-6">
            Enter your PIN code to continue
          </p>

          {loadingPins && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center gap-2">
              <Loader2 size={16} className="text-blue-500 animate-spin" />
              <p className="text-blue-600 dark:text-blue-400 text-sm">Loading...</p>
            </div>
          )}

          {pinsError && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-2">
              <WifiOff size={16} className="text-orange-500 shrink-0" />
              <p className="text-orange-600 dark:text-orange-400 text-xs">
                Offline mode. Using local PIN: 1234
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                PIN Code
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => handlePinChange(e.target.value)}
                  placeholder="Enter PIN"
                  maxLength={10}
                  required
                  disabled={loading || loadingPins}
                  autoFocus
                  inputMode="numeric"
                  className="w-full px-4 py-3.5 pr-12 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 text-center text-2xl font-mono tracking-widest transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loadingPins || !pin.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <KeyRound size={20} />
                  Unlock
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200 dark:text-slate-500 text-xs mt-6">
          © 2024 AttendEase. Secure Admin Portal.
        </p>
      </div>
    </div>
  );
}
