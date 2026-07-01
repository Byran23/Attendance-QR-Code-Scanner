import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ClipboardList, ScanLine, UserPlus, Moon, Sun, Menu, X, LogOut, ArrowLeft, Camera } from 'lucide-react';
import { DataProvider, useData } from './DataContext';
import Dashboard from './components/Dashboard';
import AttendanceLog from './components/AttendanceLog';
import QRScanner from './components/QRScanner';
import AddRecord from './components/AddRecord';
import RegistrationForm from './components/RegistrationForm';
import Login from './components/Login';

type Tab = 'dashboard' | 'scanner' | 'log' | 'add';

function AppContent() {
  const { user, logout } = useData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [autoStartCamera, setAutoStartCamera] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply dark mode class
  const applyDarkMode = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    applyDarkMode(dark);
  }, [dark, applyDarkMode]);

  // Check URL for registration mode
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === '#register' || params.get('mode') === 'register') {
        setShowRegistration(true);
      } else {
        setShowRegistration(false);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  const handleBackToAdmin = () => {
    window.location.hash = '';
  };

  const toggleDarkMode = () => {
    setDark(prev => !prev);
  };

  const handleFabClick = () => {
    setAutoStartCamera(true);
    setTab('scanner');
  };

  // Reset autoStart when leaving scanner tab
  useEffect(() => {
    if (tab !== 'scanner') {
      setAutoStartCamera(false);
    }
  }, [tab]);

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner', icon: ScanLine },
    { id: 'log', label: 'Log', icon: ClipboardList },
    { id: 'add', label: 'Register', icon: UserPlus },
  ];

  // If in registration mode, show only the registration form
  if (showRegistration) {
    return (
      <div className="relative">
        <button
          onClick={handleBackToAdmin}
          className="fixed top-4 left-4 z-[60] bg-white dark:bg-slate-800 shadow-lg rounded-full p-2.5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all border border-gray-100 dark:border-slate-700"
          title="Back to Admin"
        >
          <ArrowLeft size={20} />
        </button>
        <RegistrationForm />
      </div>
    );
  }

  // Show login if not logged in
  if (!user?.isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Top Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-950/50">
                <ClipboardList size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  AttendEase
                </h1>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight -mt-0.5">
                  Welcome, {user.username}
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-950/50'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-800 px-4 py-2 bg-white dark:bg-slate-900">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 mt-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'scanner' && <QRScanner autoStart={autoStartCamera} />}
        {tab === 'log' && <AttendanceLog />}
        {tab === 'add' && <AddRecord />}
      </main>

      {/* Floating Action Button - Scan QR */}
      {tab !== 'scanner' && (
        <button
          onClick={handleFabClick}
          className="fixed z-40 right-5 bottom-24 md:bottom-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-400/40 dark:shadow-blue-950/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 animate-bounce-in"
          title="Scan QR Code"
        >
          <Camera size={28} />
        </button>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-50 transition-colors duration-200">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                tab === item.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom spacer for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
