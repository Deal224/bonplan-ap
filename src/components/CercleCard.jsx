import { motion } from 'framer-motion';
import { formatAmount, progressPct, daysUntil } from '../lib/utils';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';

export function CercleCard({ tontine, onClick, index = 0 }) {
  const { state } = useApp();
  const T = useLang(state.lang);

  const members = tontine.tontine_members || [];
  const totalBalance = members.reduce((s, m) => s + (m.balance || 0), 0);
  const pct = progressPct(totalBalance, tontine.target_amount);
  const days = daysUntil(tontine.lock_date);
  const isCreator = tontine.creator_id === state.user?.id;

  // Limite à 5 avatars affichés
  const visibleMembers = members.slice(0, 5);
  const extra = members.length - 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-sm">
            {tontine.emoji || '🤝'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
              {tontine.name}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {members.length} {members.length > 1 ? T('cercleMembers') : T('cercleMember')}
              {isCreator && <span className="ml-2 text-violet-500 font-medium">· {T('creator')}</span>}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{days}j</p>
          <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Member avatars */}
        <div className="flex -space-x-2">
          {visibleMembers.map((m, i) => (
            <div
              key={m.id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold"
              title={m.users?.name}
            >
              {m.users?.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {extra > 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
              +{extra}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="text-xs text-slate-400">{T('totalCollected')}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatAmount(totalBalance)} <span className="text-slate-400 font-normal text-xs">GNF</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
