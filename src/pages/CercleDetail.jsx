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

function MemberRow({ member, isCurrentUser, isCreator }) {
  const pct = member.target > 0
    ? Math.min(100, Math.round((member.balance / member.target) * 100))
    : member.balance > 0 ? 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
        isCurrentUser
          ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20'
          : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
        isCurrentUser ? 'bg-violet-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
      }`}>
        {member.users?.name?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {member.users?.name || 'Membre'}
          </p>
          {isCurrentUser && (
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">(vous)</span>
          )}
          {isCreator && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              créateur
            </span>
          )}
        </div>
        {/* Mini progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-slate-900 dark:text-white">
          {formatAmount(member.balance)} <span className="text-slate-400 font-normal text-xs">GNF</span>
        </p>
        {member.target > 0 && (
          <p className="text-xs text-slate-400">/ {formatAmount(member.target)} · {pct}%</p>
        )}
      </div>
    </motion.div>
  );
}

export default function CercleDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();

  const [tontine, setTontine] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMemberTarget, setInviteMemberTarget] = useState('');

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getTontine(id);
      setTontine(res.tontine);
      setStats(res.stats);
    } catch (err) {
      toast.error(err.message);
      navigate('/cercles');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    const amt = parseInt(depositAmount, 10);
    if (!depositAmount || amt < 1000) {
      toast.error(T('minAmount'));
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.tontineDeposit(id, amt, depositNote);
      toast.success(T('contributionSaved') + ` (${res.completion_pct}%)`);
      setDepositModal(false);
      setDepositAmount('');
      setDepositNote('');
      await loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleInvite() {
    if (!invitePhone.trim()) {
      toast.error(T('fillFields'));
      return;
    }
    setActionLoading(true);
    try {
      await api.inviteMember(id, {
        phone: invitePhone.trim(),
        ...(inviteMemberTarget ? { member_target: parseInt(inviteMemberTarget, 10) } : {}),
      });
      toast.success(T('memberAdded'));
      setInviteModal(false);
      setInvitePhone('');
      setInviteMemberTarget('');
      await loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClose() {
    setActionLoading(true);
    try {
      await api.closeTontine(id);
      toast.success(T('closeCercle') + ' ✓');
      navigate('/cercles');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 w-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-52 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!tontine) return null;

  const members = tontine.tontine_members || [];
  const myMember = members.find(m => m.user_id === state.user?.id);
  const myPct = myMember && myMember.target > 0
    ? Math.min(100, Math.round((myMember.balance / myMember.target) * 100))
    : 0;
  const days = daysUntil(tontine.lock_date);
  const isClosed = tontine.status === 'closed';

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cercles')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer shadow-sm"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {tontine.emoji} {tontine.name}
          </h1>
          <p className="text-slate-400 text-sm">
            {isClosed ? T('closed') : `${stats?.members_count} ${T('cercleMembers')} · ${days}j`}
          </p>
        </div>
        {stats?.is_creator && !isClosed && (
          <button
            onClick={() => setCloseConfirm(true)}
            className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Global progress card */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="relative">
          <p className="text-white/60 text-sm mb-1">{T('totalCollected')}</p>
          <p className="text-4xl font-bold">
            {formatAmount(stats?.total_balance || 0)}
            <span className="text-white/50 text-xl ml-1">GNF</span>
          </p>

          <div className="mt-4 mb-2 flex items-center justify-between text-sm">
            <span className="text-white/60">{T('globalProgress')}</span>
            <span className="font-bold">{stats?.completion_pct || 0}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats?.completion_pct || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatAmount(stats?.total_balance || 0)} GNF</span>
            <span>{formatAmount(tontine.target_amount)} GNF</span>
          </div>

          {/* Ma contribution */}
          {myMember && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div>
                <p className="text-white/50 text-xs">{T('myContribution')}</p>
                <p className="font-bold">{formatAmount(myMember.balance)} GNF</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">{T('yourShare')}</p>
                <p className="font-bold">{myPct}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isClosed && myMember && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setDepositModal(true)}
            style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}
            className="py-4"
          >
            ↑ {T('contribute')}
          </Button>
          {stats?.is_creator && (
            <Button variant="secondary" onClick={() => setInviteModal(true)} className="py-4">
              + {T('inviteMember')}
            </Button>
          )}
        </div>
      )}

      {/* Members list */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T('members')}</h2>
        <div className="flex flex-col gap-2">
          {members.map((m, i) => (
            <MemberRow
              key={m.id}
              member={m}
              isCurrentUser={m.user_id === state.user?.id}
              isCreator={m.user_id === tontine.creator_id}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400">
        <p>📅 {T('lockDate')} : <strong className="text-slate-700 dark:text-slate-300">{formatDate(tontine.lock_date)}</strong></p>
        <p className="mt-1">🎯 {T('cercleTarget')} : <strong className="text-slate-700 dark:text-slate-300">{formatAmount(tontine.target_amount)} GNF</strong></p>
      </div>

      {/* Deposit Modal */}
      <Modal open={depositModal} onClose={() => setDepositModal(false)} title={T('contribute')}>
        <div className="flex flex-col gap-4">
          {myMember && myMember.target > 0 && (
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-3 text-sm text-violet-700 dark:text-violet-400">
              {T('yourShare')} : {formatAmount(myMember.balance)} / {formatAmount(myMember.target)} GNF ({myPct}%)
            </div>
          )}
          <Input
            label={T('amountLabel')}
            type="number"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            placeholder="10 000"
            suffix="GNF"
          />
          <Input
            label={T('note')}
            value={depositNote}
            onChange={e => setDepositNote(e.target.value)}
            placeholder="Ex: cotisation du mois..."
          />
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setDepositModal(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button loading={actionLoading} onClick={handleDeposit} className="flex-1"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}>
              ↑ {T('contribute')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title={T('inviteMember')}>
        <div className="flex flex-col gap-4">
          <div className="bg-[#FFF8E1] dark:bg-green-900/20 rounded-2xl p-3 text-xs text-[#1A4731] dark:text-green-400">
            💡 Le membre doit avoir un compte BON PLAN actif.
          </div>
          <Input
            label={T('inviteByPhone')}
            type="tel"
            value={invitePhone}
            onChange={e => setInvitePhone(e.target.value)}
            placeholder="0622 345 678"
            prefix="📱"
          />
          <Input
            label={T('memberTarget') + ' (optionnel)'}
            type="number"
            value={inviteMemberTarget}
            onChange={e => setInviteMemberTarget(e.target.value)}
            placeholder={String(tontine.target_amount)}
            suffix="GNF"
          />
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setInviteModal(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button loading={actionLoading} onClick={handleInvite} className="flex-1">
              + {T('inviteMember')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close confirm */}
      <Modal open={closeConfirm} onClose={() => setCloseConfirm(false)} title={T('closeCercle')}>
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm">{T('closeCercleDesc')}</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setCloseConfirm(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleClose} className="flex-1">
              {T('closeCercle')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
