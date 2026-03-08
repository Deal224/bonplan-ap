import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { formatAmount, progressPct } from '../lib/utils';
import { ObjectiveCard } from '../components/ObjectiveCard';
import { CercleCard } from '../components/CercleCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tontines, setTontines] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [objRes, scoreRes, tontinesRes] = await Promise.all([
        api.getObjectives(),
        api.getScore(),
        api.getTontines().catch(() => ({ tontines: [] })), // non-bloquant
      ]);
      dispatch({ type: 'SET_OBJECTIVES', objectives: objRes.objectives || [] });
      dispatch({ type: 'SET_SCORE', score: scoreRes });
      setTontines(tontinesRes.tontines || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = state.objectives
    .filter(o => o.status !== 'closed')
    .reduce((sum, o) => sum + (o.current_balance || 0), 0);

  const activeObjectives = state.objectives.filter(o => o.status !== 'closed');

  // BUG 3 FIX: locale-aware date
  const dateLocale = state.lang === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-sm capitalize">
            {new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {T('greeting')} {state.user?.name?.split(' ')[0] || ''} 👋
          </h1>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
        >
          {state.user?.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1A3C6E] to-[#0f2548] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/60 text-sm">{T('totalBalance')}</p>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_BALANCE' })}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
            >
              {state.balanceVisible ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {state.balanceVisible ? formatAmount(totalBalance) : '••••••'}
            <span className="text-white/60 text-xl ml-1">{T('gnf')}</span>
          </p>

          {state.score && (
            <div className="flex items-center gap-2 mt-4">
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                ⚡ {T('score')} {state.score.score}/100
              </div>
              <div className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/70">
                {state.score.level}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/50 text-xs">{T('objectives')}</p>
              <p className="font-bold">{activeObjectives.length}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">{T('activeDays')}</p>
              <p className="font-bold">{state.user?.days_active || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Objectives section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{T('myObjectives')}</h2>
          <Button size="sm" onClick={() => navigate('/objective/new')}>
            + {T('newObjective')}
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : activeObjectives.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{T('noObjectives')}</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{T('startSaving')}</p>
            <Button className="mt-6" onClick={() => navigate('/objective/new')}>
              {T('createFirst')}
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeObjectives.map((obj, i) => (
              <ObjectiveCard
                key={obj.id}
                objective={obj}
                index={i}
                onClick={() => navigate(`/objective/${obj.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Cercles d'épargne ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{T('cercles')}</h2>
            <p className="text-slate-400 text-xs">{T('cerclesDesc')}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/cercles')}>
            {T('myCercles')} →
          </Button>
        </div>

        {loading ? (
          <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        ) : tontines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate('/cercles')}
            className="cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
          >
            <div className="text-4xl mb-2">🤝</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{T('noCercles')}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{T('noCerclesDesc')}</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {tontines.slice(0, 2).map((t, i) => (
              <CercleCard
                key={t.id}
                tontine={t}
                index={i}
                onClick={() => navigate(`/cercle/${t.id}`)}
              />
            ))}
            {tontines.length > 2 && (
              <button
                onClick={() => navigate('/cercles')}
                className="text-center text-sm text-violet-600 dark:text-violet-400 font-medium py-2 cursor-pointer hover:underline"
              >
                Voir les {tontines.length - 2} autres cercles →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
