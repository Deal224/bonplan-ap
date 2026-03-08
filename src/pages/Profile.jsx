import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PinInput } from '../components/ui/PinInput';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const { state, dispatch } = useApp();
  const T = useLang(state.lang);
  const toast = useToast();
  const [pinModal, setPinModal] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(state.user?.name || '');
  const [pins, setPins] = useState({ current: '', newPin: '', confirm: '' });
  const [pinStep, setPinStep] = useState(1);

  async function handleSaveName() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.updateProfile({ name: name.trim() });
      dispatch({ type: 'SET_USER', user: res.user });
      toast.success(T('save') + ' ✓');
      setNameEdit(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePin() {
    // BUG 3 FIX: use T() for error messages
    if (pins.newPin !== pins.confirm) {
      toast.error(T('pinMismatch'));
      return;
    }
    if (pins.newPin.length !== 4) {
      toast.error(T('pinLength'));
      return;
    }
    setLoading(true);
    try {
      await api.changePin({ current_pin: pins.current, new_pin: pins.newPin });
      toast.success(T('changePin') + ' ✓');
      setPinModal(false);
      setPins({ current: '', newPin: '', confirm: '' });
      setPinStep(1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    dispatch({ type: 'LOGOUT' });
  }

  const avatar = state.user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T('profile')}</h1>
      </div>

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1A3C6E] to-[#0f2548] rounded-3xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold truncate">{state.user?.name}</p>
            <p className="text-white/60 text-sm">{state.user?.phone}</p>
            <span className="inline-block bg-white/20 text-xs px-2.5 py-1 rounded-full mt-1 capitalize">
              Plan {state.user?.plan || 'free'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Account section */}
      <div className="flex flex-col gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* BUG 3 FIX: section header via T() */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{T('account')}</p>
          </div>

          {nameEdit ? (
            <div className="p-4 flex flex-col gap-3">
              <Input
                label={T('nameLabel')}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Votre nom"
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setNameEdit(false)} className="flex-1">
                  {T('cancel')}
                </Button>
                <Button loading={loading} onClick={handleSaveName} className="flex-1">
                  {T('save')}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setName(state.user?.name || ''); setNameEdit(true); }}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{T('nameLabel')}</p>
                  <p className="text-xs text-slate-400">{state.user?.name}</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          )}

          <button
            onClick={() => setPinModal(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔐</span>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{T('changePin')}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Preferences — BUG 3 FIX */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{T('preferences')}</p>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-xl">{state.darkMode ? '🌙' : '☀️'}</span>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{T('darkMode')}</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_DARK', value: !state.darkMode })}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${state.darkMode ? 'bg-[#1A3C6E]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${state.darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌍</span>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{T('language')}</p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              {['fr', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => dispatch({ type: 'SET_LANG', value: l })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    state.lang === l
                      ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* About — BUG 3 FIX */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{T('about')}</p>
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">BON PLAN</p>
                <p className="text-xs text-slate-400">{T('version')} 4.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
        >
          {T('logout')}
        </button>
      </div>

      {/* PIN Change Modal — BUG 3 FIX: all strings via T() */}
      <Modal
        open={pinModal}
        onClose={() => { setPinModal(false); setPinStep(1); setPins({ current: '', newPin: '', confirm: '' }); }}
        title={T('changePin')}
      >
        <div className="flex flex-col gap-5">
          {pinStep === 1 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{T('pinCurrentStep')}</p>
              <PinInput value={pins.current} onChange={v => setPins(p => ({ ...p, current: v }))} secret />
              <Button fullWidth onClick={() => {
                if (pins.current.length === 4) setPinStep(2);
                else toast.error(T('pinLength'));
              }}>
                {T('continue')}
              </Button>
            </>
          )}
          {pinStep === 2 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{T('pinNewStep')}</p>
              <PinInput value={pins.newPin} onChange={v => setPins(p => ({ ...p, newPin: v }))} secret />
              <Button fullWidth onClick={() => {
                if (pins.newPin.length === 4) setPinStep(3);
                else toast.error(T('pinLength'));
              }}>
                {T('continue')}
              </Button>
            </>
          )}
          {pinStep === 3 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{T('pinConfirmStep')}</p>
              <PinInput value={pins.confirm} onChange={v => setPins(p => ({ ...p, confirm: v }))} secret />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setPinStep(2)} className="flex-1">{T('back')}</Button>
                <Button loading={loading} onClick={handleChangePin} className="flex-1">{T('confirm')}</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
