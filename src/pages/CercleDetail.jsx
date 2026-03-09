import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { formatAmount, formatDate, daysUntil } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

// ── Helpers ──────────────────────────────────────────────────────────

function hoursUntil(date) {
  if (!date) return 0;
  return Math.max(0, Math.ceil((new Date(date) - new Date()) / 3600000));
}

function VoteBar({ yes, no, pending, total }) {
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
  const noPct  = total > 0 ? Math.round((no  / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>✓ OUI : {yes}</span>
        <span>✗ NON : {no}</span>
        <span>⏳ En attente : {pending}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
        <motion.div initial={{ width: 0 }} animate={{ width: `${yesPct}%` }} transition={{ duration: 0.6 }}
          className="h-full bg-emerald-500" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${noPct}%` }} transition={{ duration: 0.6 }}
          className="h-full bg-red-400" />
      </div>
      <p className="text-xs text-slate-400 text-center">Majorité requise : {Math.floor(total / 2) + 1} vote(s) OUI</p>
    </div>
  );
}

function MemberRow({ member, isCurrentUser, isCreator, onApprove, onRefuse, viewerIsCreator }) {
  const pct = member.target > 0
    ? Math.min(100, Math.round((member.balance / member.target) * 100))
    : member.balance > 0 ? 100 : 0;
  const isPendingLeave = member.status === 'pending_leave';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
        isPendingLeave
          ? 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
          : isCurrentUser
          ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20'
          : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
        isPendingLeave ? 'bg-amber-500' : isCurrentUser ? 'bg-violet-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
      }`}>
        {member.users?.name?.[0]?.toUpperCase() || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {member.users?.name || 'Membre'}
          </p>
          {isCurrentUser && <span className="text-xs text-violet-600 dark:text-violet-400">(vous)</span>}
          {isCreator && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">créateur</span>
          )}
          {isPendingLeave && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">⏳ retrait en attente</span>
          )}
          {member.close_vote === true && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">✓ OUI</span>
          )}
          {member.close_vote === false && (
            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">✗ NON</span>
          )}
        </div>

        <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : isPendingLeave ? 'bg-amber-400' : 'bg-violet-500'}`}
          />
        </div>

        {isPendingLeave && viewerIsCreator && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => onApprove(member.id)}
              className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-lg font-semibold hover:bg-emerald-200 cursor-pointer">
              ✓ Accepter
            </button>
            <button onClick={() => onRefuse(member.id)}
              className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-1 rounded-lg font-semibold hover:bg-red-200 cursor-pointer">
              ✗ Refuser
            </button>
          </div>
        )}
      </div>

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

// ── Page ─────────────────────────────────────────────────────────────

export default function CercleDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();

  const [tontine, setTontine] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [depositModal, setDepositModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [proposeCloseConfirm, setProposeCloseConfirm] = useState(false);

  // Form fields
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
    if (!depositAmount || amt < 1000) { toast.error(T('minAmount')); return; }
    setActionLoading(true);
    try {
      const res = await api.tontineDeposit(id, amt, depositNote);
      toast.success(res.message);
      setDepositModal(false); setDepositAmount(''); setDepositNote('');
      await loadData();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleInvite() {
    if (!invitePhone.trim()) { toast.error(T('fillFields')); return; }
    setActionLoading(true);
    try {
      const res = await api.inviteMember(id, {
        phone: invitePhone.trim(),
        ...(inviteMemberTarget ? { member_target: parseInt(inviteMemberTarget, 10) } : {}),
      });
      toast.success(res.message);
      setInviteModal(false); setInvitePhone(''); setInviteMemberTarget('');
      if (!res.pending) await loadData();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleLeave() {
    setActionLoading(true);
    try {
      await api.leaveTontine(id);
      toast.success('Demande envoyée au créateur.');
      setLeaveConfirm(false);
      await loadData();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleProposeClose() {
    setActionLoading(true);
    try {
      const res = await api.proposeClose(id);
      toast.success(res.message);
      setProposeCloseConfirm(false);
      if (res.closed) navigate('/cercles');
      else await loadData();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleVoteClose(vote) {
    setActionLoading(true);
    try {
      const res = await api.voteClose(id, vote);
      toast.success(res.message);
      if (res.closed) navigate('/cercles');
      else await loadData();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleForceClose() {
    setActionLoading(true);
    try {
      await api.closeTontine(id);
      toast.success('Cercle fermé.');
      navigate('/cercles');
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleApproveLeave(memberId, approved) {
    try {
      const res = await api.approveLeave(id, { member_id: memberId, approved });
      toast.success(res.message);
      await loadData();
    } catch (err) { toast.error(err.message); }
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

  const members = (tontine.tontine_members || []).filter(m => m.status !== 'left');
  const myMember = members.find(m => m.user_id === state.user?.id);
  const myPct = myMember && myMember.target > 0
    ? Math.min(100, Math.round((myMember.balance / myMember.target) * 100))
    : 0;
  const isClosed  = tontine.status === 'closed';
  const isClosing = tontine.status === 'closing';
  const pendingLeaveCount = members.filter(m => m.status === 'pending_leave').length;
  const hoursLeft = hoursUntil(stats?.close_deadline);

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cercles')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer shadow-sm"
        >←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {tontine.emoji} {tontine.name}
            {isClosing && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-normal">Vote en cours</span>}
          </h1>
          <p className="text-slate-400 text-sm">
            {isClosed ? '🔒 Clôturé' : `${stats?.members_count} membres · ${daysUntil(tontine.lock_date)}j restants`}
          </p>
        </div>
        {/* Creator: propose close button (only when active) */}
        {stats?.is_creator && !isClosed && !isClosing && (
          <button
            onClick={() => setProposeCloseConfirm(true)}
            className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
            title="Proposer la fermeture"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Description + "à la fermeture" notice */}
      {tontine.description && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
          <p>{tontine.description}</p>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
        💡 <strong>À la fermeture</strong>, les fonds collectés seront remis au créateur du cercle.
      </div>

      {/* Pending leave banner */}
      {stats?.is_creator && pendingLeaveCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-3 text-amber-700 dark:text-amber-400 text-sm font-medium">
          ⏳ {pendingLeaveCount} demande{pendingLeaveCount > 1 ? 's' : ''} de retrait en attente · voir ci-dessous
        </div>
      )}

      {/* ── Vote de fermeture en cours ── */}
      {isClosing && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-red-700 dark:text-red-400">⏳ Vote de fermeture en cours</h3>
            <span className="text-xs text-red-500 font-medium">
              {hoursLeft > 0 ? `${hoursLeft}h restantes` : 'Délai expiré'}
            </span>
          </div>

          <VoteBar
            yes={stats?.vote_yes || 0}
            no={stats?.vote_no || 0}
            pending={stats?.vote_pending || 0}
            total={stats?.members_count || 1}
          />

          {/* Member vote buttons */}
          {!stats?.is_creator && myMember?.status === 'active' && stats?.my_close_vote === null && (
            <div className="flex gap-3">
              <Button
                onClick={() => handleVoteClose(true)}
                loading={actionLoading}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                ✓ J'accepte la fermeture
              </Button>
              <Button variant="ghost" onClick={() => handleVoteClose(false)} loading={actionLoading} className="flex-1 border-red-200 text-red-500">
                ✗ Je refuse
              </Button>
            </div>
          )}

          {/* Already voted */}
          {!stats?.is_creator && stats?.my_close_vote !== null && (
            <div className={`text-center text-sm font-medium py-2 rounded-xl ${stats.my_close_vote ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              Vous avez voté : {stats.my_close_vote ? '✓ OUI' : '✗ NON'}
            </div>
          )}

          {/* Force close for creator after 7 days */}
          {stats?.is_creator && stats?.can_force_close && (
            <Button variant="danger" onClick={handleForceClose} loading={actionLoading} fullWidth>
              ⚡ Forcer la fermeture (7 jours écoulés)
            </Button>
          )}

          {stats?.is_creator && !stats?.can_force_close && (
            <p className="text-xs text-red-400 text-center">
              Vous pourrez forcer la fermeture 7 jours après la proposition.
            </p>
          )}
        </div>
      )}

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
              initial={{ width: 0 }} animate={{ width: `${stats?.completion_pct || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatAmount(stats?.total_balance || 0)} GNF</span>
            <span>{formatAmount(tontine.target_amount)} GNF</span>
          </div>
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
      {!isClosed && !isClosing && myMember && (
        <div className="grid grid-cols-2 gap-3">
          {myMember.status === 'active' && (
            <Button onClick={() => setDepositModal(true)}
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }} className="py-4">
              ↑ {T('contribute')}
            </Button>
          )}
          {stats?.is_creator && (
            <Button variant="secondary" onClick={() => setInviteModal(true)} className="py-4">
              + {T('inviteMember')}
            </Button>
          )}
          {!stats?.is_creator && myMember.status === 'active' && (
            <Button variant="ghost" onClick={() => setLeaveConfirm(true)} className="py-4 text-red-500 border-red-200">
              🚪 Quitter
            </Button>
          )}
          {!stats?.is_creator && myMember.status === 'pending_leave' && (
            <div className="col-span-2 text-center text-sm text-amber-600 dark:text-amber-400 font-medium py-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              ⏳ Retrait en attente d'approbation...
            </div>
          )}
        </div>
      )}

      {/* Members list */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T('members')}</h2>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isCurrentUser={m.user_id === state.user?.id}
              isCreator={m.user_id === tontine.creator_id}
              viewerIsCreator={stats?.is_creator}
              onApprove={(memberId) => handleApproveLeave(memberId, true)}
              onRefuse={(memberId) => handleApproveLeave(memberId, false)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400 space-y-1">
        <p>📅 {T('lockDate')} : <strong className="text-slate-700 dark:text-slate-300">{formatDate(tontine.lock_date)}</strong></p>
        <p>🎯 {T('cercleTarget')} : <strong className="text-slate-700 dark:text-slate-300">{formatAmount(tontine.target_amount)} GNF</strong></p>
      </div>

      {/* ── Modals ── */}

      <Modal open={depositModal} onClose={() => setDepositModal(false)} title={T('contribute')}>
        <div className="flex flex-col gap-4">
          {myMember && myMember.target > 0 && (
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-3 text-sm text-violet-700 dark:text-violet-400">
              {T('yourShare')} : {formatAmount(myMember.balance)} / {formatAmount(myMember.target)} GNF ({myPct}%)
            </div>
          )}
          <Input label={T('amountLabel')} type="number" value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)} placeholder="10 000" suffix="GNF" />
          <Input label={T('note')} value={depositNote}
            onChange={e => setDepositNote(e.target.value)} placeholder="Ex: cotisation du mois..." />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDepositModal(false)} className="flex-1">{T('cancel')}</Button>
            <Button loading={actionLoading} onClick={handleDeposit} className="flex-1"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}>↑ {T('contribute')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title={T('inviteMember')}>
        <div className="flex flex-col gap-4">
          <div className="bg-[#FFF8E1] dark:bg-green-900/20 rounded-2xl p-3 text-xs text-[#1A4731] dark:text-green-400">
            💡 Si le numéro n'est pas sur BON PLAN, il recevra l'invitation à son inscription.
          </div>
          <Input label={T('inviteByPhone')} type="tel" value={invitePhone}
            onChange={e => setInvitePhone(e.target.value)} placeholder="0622 345 678" prefix="📱" />
          <Input label={T('memberTarget') + ' (optionnel)'} type="number" value={inviteMemberTarget}
            onChange={e => setInviteMemberTarget(e.target.value)}
            placeholder={String(tontine.target_amount)} suffix="GNF" />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setInviteModal(false)} className="flex-1">{T('cancel')}</Button>
            <Button loading={actionLoading} onClick={handleInvite} className="flex-1">+ {T('inviteMember')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={leaveConfirm} onClose={() => setLeaveConfirm(false)} title="Quitter le cercle">
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Votre demande sera envoyée au créateur. Il devra l'approuver pour finaliser votre retrait.
          </p>
          {myMember && myMember.balance > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-sm text-emerald-700 dark:text-emerald-400">
              💰 Si approuvé, votre solde de <strong>{formatAmount(myMember.balance)} GNF</strong> vous sera restitué.
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setLeaveConfirm(false)} className="flex-1">{T('cancel')}</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleLeave} className="flex-1">
              🚪 Envoyer la demande
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={proposeCloseConfirm} onClose={() => setProposeCloseConfirm(false)} title="Proposer la fermeture">
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 space-y-2 text-sm text-red-700 dark:text-red-400">
            <p className="font-bold">⚠️ Conséquences de la fermeture :</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Un vote sera envoyé à tous les membres (72h pour répondre)</li>
              <li>Sans réponse dans 72h, le vote compte comme OUI</li>
              <li>Si la majorité vote OUI, le cercle est fermé</li>
              <li>La totalité des fonds collectés (<strong>{formatAmount(stats?.total_balance || 0)} GNF</strong>) vous sera remise</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setProposeCloseConfirm(false)} className="flex-1">{T('cancel')}</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleProposeClose} className="flex-1">
              📢 Lancer le vote
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
