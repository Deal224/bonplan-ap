import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { formatAmount, formatDate, progressPct, daysUntil } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export default function ObjectiveDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();

  const [objective, setObjective] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: '', note: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', note: '' });

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [objRes, txRes] = await Promise.all([
        api.getObjective(id),
        api.getTransactions(id),
      ]);
      setObjective(objRes.objective);
      setStats(objRes.stats);
      setTransactions(txRes.transactions || []);
    } catch (err) {
      toast.error(err.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  // Route correcte : POST /api/transactions/:id/deposit → { amount: int, note?: string }
  async function handleDeposit() {
    const amt = parseInt(depositForm.amount, 10);
    if (!depositForm.amount || amt < 1000) {
      toast.error(T('minAmount'));
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.deposit(id, amt, depositForm.note);
      const msg = res.milestone_reached?.reached
        ? res.milestone_reached.message
        : res.message || T('paymentSuccess');
      toast.success(msg);
      setDepositModal(false);
      setDepositForm({ amount: '', note: '' });
      await loadData();
    } catch (err) {
      console.error('[Deposit error]', err);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Route correcte : POST /api/transactions/:id/withdraw → { amount: int, note?: string }
  async function handleWithdraw() {
    const amt = parseInt(withdrawForm.amount, 10);
    if (!withdrawForm.amount || amt < 1) {
      toast.error(T('fillFields'));
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.withdraw(id, amt, withdrawForm.note);
      if (res.approved) {
        toast.success(res.message);
        await loadData();
      } else {
        // Retrait refusé par les règles métier (résistance comptabilisée)
        if (res.is_resistance) {
          toast.success(`💪 ${res.message}`);
        } else {
          toast.error(res.message);
        }
      }
      setWithdrawModal(false);
      setWithdrawForm({ amount: '', note: '' });
    } catch (err) {
      console.error('[Withdraw error]', err);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await api.deleteObjective(id);
      const objRes = await api.getObjectives();
      dispatch({ type: 'SET_OBJECTIVES', objectives: objRes.objectives || [] });
      toast.success(T('objectiveClosed'));
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function getRuleLabel(rule) {
    if (!rule) return T('noRestriction');
    switch (rule.type) {
      case 'none': return T('noRestriction');
      case 'max_monthly': return `${T('maxMonthly')} : ${formatAmount(rule.max_monthly || rule.value)} ${T('gnf')}`;
      case 'min_balance': return `${T('minBalanceRule')} : ${formatAmount(rule.min_balance || rule.value)} ${T('gnf')}`;
      case 'max_amount': return `${T('maxPerWithdraw')} : ${formatAmount(rule.max_withdraw || rule.value)} ${T('gnf')}`;
      default: return rule.type;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!objective) return null;

  const pct = progressPct(objective.current_balance, objective.target_amount);
  const days = daysUntil(objective.lock_date);
  const remaining = Math.max(0, (objective.target_amount || 0) - (objective.current_balance || 0));
  const completed = pct >= 100;

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer shadow-sm"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {objective.emoji} {objective.name}
          </h1>
          <p className="text-slate-400 text-sm">
            {objective.status === 'closed'
              ? T('closed')
              : completed
              ? T('objectiveReached')
              : `${days} ${T('daysLeft')}`}
          </p>
        </div>
        {objective.status !== 'closed' && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        )}
      </div>

      {/* Main card */}
      <div className="bg-gradient-to-br from-[#1A3C6E] to-[#0f2548] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="relative">
          <p className="text-white/60 text-sm mb-1">{T('currentBalance')}</p>
          <p className="text-4xl font-bold">
            {formatAmount(objective.current_balance)}
            <span className="text-white/50 text-xl ml-1">{T('gnf')}</span>
          </p>

          <div className="mt-4 mb-2 flex items-center justify-between text-sm">
            <span className="text-white/60">{T('progress')}</span>
            <span className="font-bold">{pct}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${completed ? 'bg-emerald-400' : 'bg-white'}`}
            />
          </div>

          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatAmount(objective.current_balance)} {T('gnf')}</span>
            <span>{formatAmount(objective.target_amount)} {T('gnf')}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/50 text-xs">{T('remaining')}</p>
              <p className="font-bold text-sm">{formatAmount(remaining)}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">{T('deposits')}</p>
              <p className="font-bold text-sm">{stats?.deposits_count || 0}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">{T('resistances')}</p>
              <p className="font-bold text-sm">{stats?.resistances || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lock info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🔒</span>
        <div>
          <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
            {stats?.is_locked
              ? `${T('lockedUntil')} ${formatDate(objective.lock_date)}`
              : T('unlocked')}
          </p>
          <p className="text-amber-600 dark:text-amber-500 text-xs">
            {T('ruleLabel')} : {getRuleLabel(objective.rule)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {objective.status !== 'closed' && (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setDepositModal(true)} className="py-4">
            ↑ {T('deposit')}
          </Button>
          <Button variant="secondary" onClick={() => setWithdrawModal(true)} className="py-4">
            ↓ {T('withdraw')}
          </Button>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T('transactions')}</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">{T('noTransactions')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  tx.type === 'deposit' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'
                }`}>
                  {tx.type === 'deposit' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {tx.type === 'deposit' ? T('deposit_tx') : T('withdrawal_tx')}
                    {tx.note && <span className="text-slate-400 font-normal ml-1">— {tx.note}</span>}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(tx.created_at)}</p>
                </div>
                <p className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)} {T('gnf')}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Modal open={depositModal} onClose={() => setDepositModal(false)} title={T('deposit')}>
        <div className="flex flex-col gap-4">
          <Input
            label={T('amountLabel')}
            type="number"
            value={depositForm.amount}
            onChange={e => setDepositForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="10 000"
            suffix={T('gnf')}
          />
          {remaining > 0 && (
            <p className="text-xs text-slate-400">
              {T('remainingLabel')} : {formatAmount(remaining)} {T('gnf')}
            </p>
          )}
          <Input
            label={T('note')}
            value={depositForm.note}
            onChange={e => setDepositForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Ex: salaire du mois..."
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDepositModal(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button loading={actionLoading} onClick={handleDeposit} className="flex-1">
              ↑ {T('deposit')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title={T('withdraw')}>
        <div className="flex flex-col gap-4">
          {stats?.is_locked && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-sm text-amber-800 dark:text-amber-400">
              🔒 {T('lockedUntil')} {formatDate(objective.lock_date)}
            </div>
          )}
          <Input
            label={T('amount')}
            type="number"
            value={withdrawForm.amount}
            onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="5 000"
            suffix={T('gnf')}
          />
          <Input
            label={T('note')}
            value={withdrawForm.note}
            onChange={e => setWithdrawForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Motif du retrait..."
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setWithdrawModal(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button variant="secondary" loading={actionLoading} onClick={handleWithdraw} className="flex-1">
              ↓ {T('withdraw')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title={T('closeObjective')}>
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm">{T('closeDesc')}</p>
          {objective.current_balance > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-sm text-amber-800 dark:text-amber-400">
              {T('currentBalanceLabel')} : <strong>{formatAmount(objective.current_balance)} {T('gnf')}</strong>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete} className="flex-1">
              {T('closeBtn')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
