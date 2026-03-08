import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { scoreColor, formatAmount } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

function ScoreCircle({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = score / 100;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        <motion.circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.p>
        <p className="text-slate-400 text-sm">/ 100</p>
      </div>
    </div>
  );
}

export default function Score() {
  const { state } = useApp();
  const T = useLang(state.lang);
  const toast = useToast();
  const [scoreData, setScoreData] = useState(null);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('score');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [scoreRes, passportRes] = await Promise.all([
        api.getScore(),
        api.getPassport(),
      ]);
      setScoreData(scoreRes);
      setPassport(passportRes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  // BUG 3 FIX: passport tab label via T()
  const passportLabel = `🪪 ${T('passport')}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T('score')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{T('scoreDesc')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
        {[
          { key: 'score', label: `⚡ ${T('score')}` },
          { key: 'passport', label: passportLabel },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              tab === t.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'score' && scoreData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          {/* Score circle */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-3">
            <ScoreCircle score={scoreData.score} />
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{scoreData.level}</p>
              {/* BUG 3 FIX */}
              <p className="text-slate-400 text-sm mt-1">
                {scoreData.score >= 80 ? T('scoreExcellent')
                  : scoreData.score >= 50 ? T('scoreGood')
                  : T('scoreBeginner')}
              </p>
            </div>
          </div>

          {/* Score tips — BUG 3 FIX */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#1A3C6E] dark:text-blue-400 mb-2">{T('scoreTips')}</p>
            <ul className="text-xs text-blue-700/80 dark:text-blue-400/80 flex flex-col gap-1.5">
              <li className="flex items-center gap-2">✓ {T('tip1')}</li>
              <li className="flex items-center gap-2">✓ {T('tip2')}</li>
              <li className="flex items-center gap-2">✓ {T('tip3')}</li>
              <li className="flex items-center gap-2">✓ {T('tip4')}</li>
            </ul>
          </div>

          {/* Badges */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T('badges')}</h2>
            {!scoreData.badges || scoreData.badges.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-4xl mb-2">🏅</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{T('noBadges')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {scoreData.badges.map((badge, i) => (
                  <motion.div
                    key={badge.id || i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 text-center"
                  >
                    <span className="text-3xl">{badge.emoji || '🏅'}</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{badge.name}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {tab === 'passport' && passport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          {/* Passport card */}
          <div className="bg-gradient-to-br from-[#1A3C6E] via-[#1e4a87] to-[#0f2548] rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
              <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-widest">Bon Plan</p>
                  {/* BUG 3 FIX */}
                  <p className="text-white/50 text-xs uppercase tracking-widest">{T('passport')}</p>
                </div>
                <span className="text-4xl">💰</span>
              </div>

              <p className="text-2xl font-bold mb-1">{passport.user?.name}</p>
              <p className="text-white/50 text-sm mb-6">{passport.user?.phone}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* BUG 3 FIX */}
                  <p className="text-white/50 text-xs">{T('totalSaved')}</p>
                  <p className="text-xl font-bold">{formatAmount(passport.passport?.total_saved)} {T('gnf')}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">{T('score')}</p>
                  <p className="text-xl font-bold">{passport.passport?.score}/100</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">{T('completedObjectives')}</p>
                  <p className="text-xl font-bold">{passport.passport?.completed_objectives}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">{T('resistances')}</p>
                  <p className="text-xl font-bold">{passport.passport?.resistances}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">{T('score')}</p>
                  <p className="text-sm font-semibold">{passport.passport?.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">{T('activeDays')}</p>
                  <p className="text-sm font-semibold">{passport.passport?.days_active}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={() => {
              const text = `${T('passport')} BON PLAN\n💰 ${T('totalSaved')}: ${formatAmount(passport.passport?.total_saved)} ${T('gnf')}\n⚡ ${T('score')}: ${passport.passport?.score}/100\n🏆 ${passport.passport?.level}`;
              if (navigator.share) {
                navigator.share({ title: 'BON PLAN Passport', text });
              } else {
                navigator.clipboard?.writeText(text);
                toast.success(T('copied'));
              }
            }}
            className="w-full py-3 rounded-2xl border-2 border-[#1A3C6E] dark:border-blue-500 text-[#1A3C6E] dark:text-blue-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            {T('share')}
          </button>

          {/* Stats — BUG 3 FIX: use T() for all labels */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">{T('statistics')}</p>
            <div className="flex flex-col gap-3">
              {[
                { labelKey: 'objectivesCreated', value: passport.passport?.objectives_count, icon: '🎯' },
                { labelKey: 'completedObjectives', value: passport.passport?.completed_objectives, icon: '✅' },
                { labelKey: 'withdrawalResistances', value: passport.passport?.refused_withdrawals, icon: '💪' },
                { labelKey: 'consecutiveDays', value: passport.passport?.days_active, icon: '📅' },
              ].map(stat => (
                <div key={stat.labelKey} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{T(stat.labelKey)}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{stat.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
