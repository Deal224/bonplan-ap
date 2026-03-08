import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all cursor-pointer ${
        active ? 'text-[#1A4731] dark:text-yellow-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      <div className={`relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
        active ? 'bg-[#FFF8E1] dark:bg-yellow-900/30' : ''
      }`}>
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 bg-[#FFF8E1] dark:bg-yellow-900/30 rounded-2xl"
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          />
        )}
        <span className="relative text-xl">{icon}</span>
      </div>
      <span className={`text-xs font-medium ${active ? 'text-[#1A4731] dark:text-yellow-400' : ''}`}>{label}</span>
    </button>
  );
}

const NAV_ITEMS = [
  { path: '/', icon: '🏠', labelKey: 'home' },
  { path: '/cercles', icon: '🤝', labelKey: 'cercles' },
  { path: '/history', icon: '📋', labelKey: 'history' },
  { path: '/score', icon: '⚡', labelKey: 'score' },
  { path: '/profile', icon: '👤', labelKey: 'profile' },
];

export function Layout({ children }) {
  const { state } = useApp();
  const T = useLang(state.lang);
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoot = '/' + location.pathname.split('/')[1];
  const activeNav = NAV_ITEMS.find(n => n.path === currentRoot || (n.path === '/' && location.pathname === '/'))?.path || '/';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Desktop header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-bold text-[#1A4731] dark:text-yellow-400">BON PLAN</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeNav === item.path
                    ? 'bg-[#FFBE00] text-[#1A4731]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {item.icon} {T(item.labelKey)}
              </button>
            ))}
          </nav>
          <div className="w-8 h-8 rounded-full bg-[#1A4731] text-white flex items-center justify-center text-xs font-bold">
            {state.user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:pt-16 md:pb-4">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-28 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={T(item.labelKey)}
              active={activeNav === item.path || (item.path === '/' && location.pathname === '/')}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
