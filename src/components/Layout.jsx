import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { useToast } from './ui/Toast';

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
  { path: '/dashboard', icon: '🏠', labelKey: 'home' },
  { path: '/cercles', icon: '🤝', labelKey: 'cercles' },
  { path: '/history', icon: '📋', labelKey: 'history' },
  { path: '/score', icon: '⚡', labelKey: 'score' },
  { path: '/profile', icon: '👤', labelKey: 'profile' },
];

function NotificationsBell() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadNotifs();
    const iv = setInterval(loadNotifs, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadNotifs() {
    try {
      console.log('[NOTIFS] Polling GET /api/notifications...');
      const res = await api.getNotifications();
      const all = res.notifications || [];
      console.log(`[NOTIFS] ${all.length} notifications reçues:`, all.map(n => ({ id: n.id, type: n.type, read: n.read, tontine_id: n.tontine_id })));
      const invites = all.filter(n => n.type === 'circle_invite' && !n.read);
      if (invites.length > 0) {
        console.log(`[NOTIFS] ${invites.length} invitation(s) circle_invite non lue(s) → boutons Accepter/Refuser doivent être rendus`, invites.map(n => n.id));
      }
      setNotifs(all);
    } catch (e) {
      console.error('[NOTIFS] Erreur polling:', e);
    }
  }

  async function markRead(id) {
    try {
      await api.markNotificationRead(id);
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {}
  }

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead();
      setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    } catch (e) {}
  }

  const unread = notifs.filter(n => !n.read).length;

  const typeIcon = { leave_request: '⏳', leave_approved: '✅', leave_refused: '❌', circle_invite: '🤝', close_vote: '🗳️', circle_closed: '🔒' };

  async function handleAcceptInvite(n) {
    try {
      const res = await api.acceptInvite(n.tontine_id);
      toast.success(res.message);
      setNotifs(ns => ns.filter(x => x.id !== n.id));
      setOpen(false);
      navigate(`/cercle/${n.tontine_id}`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDeclineInvite(n) {
    try {
      await api.declineInvite(n.tontine_id);
      setNotifs(ns => ns.filter(x => x.id !== n.id));
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleVoteClose(n, vote) {
    try {
      const res = await api.voteClose(n.tontine_id, vote);
      toast.success(res.message);
      setNotifs(ns => ns.filter(x => x.id !== n.id));
      if (res.closed) navigate(`/cercles`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#1A4731] dark:text-yellow-400 font-medium hover:underline cursor-pointer">
                  Tout lire
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Aucune notification</p>
              ) : (
                notifs.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${
                      !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.content}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {n.type === 'circle_invite' && !n.read && (
                        <div className="flex gap-2 mt-2">
                          {console.log(`[NOTIFS] Rendu boutons Accepter/Refuser pour notif id=${n.id} tontine_id=${n.tontine_id}`)}
                          <button onClick={() => handleAcceptInvite(n)}
                            className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg font-semibold hover:bg-emerald-200 cursor-pointer">
                            ✓ Rejoindre
                          </button>
                          <button onClick={() => handleDeclineInvite(n)}
                            className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg font-semibold hover:bg-red-200 cursor-pointer">
                            ✗ Refuser
                          </button>
                        </div>
                      )}
                      {n.type === 'close_vote' && !n.read && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleVoteClose(n, true)}
                            className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg font-semibold hover:bg-emerald-200 cursor-pointer">
                            ✓ J'accepte
                          </button>
                          <button onClick={() => handleVoteClose(n, false)}
                            className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg font-semibold hover:bg-red-200 cursor-pointer">
                            ✗ Je refuse
                          </button>
                        </div>
                      )}
                    </div>
                    {!n.read && n.type !== 'circle_invite' && (
                      <button onClick={() => markRead(n.id)} className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 cursor-pointer" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Layout({ children }) {
  const { state } = useApp();
  const T = useLang(state.lang);
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoot = '/' + location.pathname.split('/')[1];
  const activeNav = NAV_ITEMS.find(n => n.path === currentRoot)?.path || '/dashboard';

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
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <div className="w-8 h-8 rounded-full bg-[#1A4731] text-white flex items-center justify-center text-xs font-bold">
              {state.user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile top bar (notifications only) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 px-4 h-12 flex items-center justify-between">
        <span className="font-bold text-[#1A4731] dark:text-yellow-400 text-sm">💰 BON PLAN</span>
        <NotificationsBell />
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-16 md:pb-4 pt-12">
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
              active={activeNav === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
