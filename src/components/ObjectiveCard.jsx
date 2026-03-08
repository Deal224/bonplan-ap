import { motion } from 'framer-motion';
import { formatAmount, progressPct, daysUntil } from '../lib/utils';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';

export function ObjectiveCard({ objective, onClick, index = 0 }) {
  const { state } = useApp();
  const T = useLang(state.lang);
  const pct = progressPct(objective.current_balance, objective.target_amount);
  const days = daysUntil(objective.lock_date);
  const completed = pct >= 100;

  // Palette nouvelle : vert foncé / doré / autres couleurs vives
  const gradients = [
    'from-[#1A4731] to-[#0f2f1a]',
    'from-emerald-600 to-teal-700',
    'from-amber-500 to-orange-600',
    'from-violet-600 to-purple-700',
    'from-rose-500 to-pink-600',
    'from-cyan-600 to-sky-700',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-5 text-white shadow-sm relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-3xl">{objective.emoji || '🎯'}</span>
              <h3 className="font-bold text-lg mt-1 leading-tight">{objective.name}</h3>
            </div>
            <div className="text-right">
              {completed ? (
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  ✓ {T('completed')}
                </span>
              ) : objective.status === 'closed' ? (
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {T('closed')}
                </span>
              ) : (
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {days}j restants
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/20 rounded-full mb-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-xs">{T('progress')}</p>
              <p className="font-bold text-lg">
                {formatAmount(objective.current_balance)}
                <span className="text-white/60 text-sm font-normal ml-1">GNF</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Objectif</p>
              <p className="font-semibold text-sm">{formatAmount(objective.target_amount)} GNF</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">{T('progress')}</p>
              <p className="font-bold text-xl">{pct}%</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
