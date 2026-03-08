import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PinInput } from '../components/ui/PinInput';
import { useToast } from '../components/ui/Toast';

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const T = useLang(state.lang);
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', pin: '', name: '' });
  const [error, setError] = useState('');

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!form.phone || form.phone.length < 8) { setError(T('phoneInvalid')); return; }
      if (mode === 'register' && !form.name.trim()) { setError(T('fillFields')); return; }
      setStep(2);
      return;
    }
    if (form.pin.length !== 4) { setError(T('pinLength')); return; }
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login({ phone: form.phone, pin: form.pin })
        : await api.register({ phone: form.phone, pin: form.pin, name: form.name });
      dispatch({ type: 'SET_AUTH', token: res.token, user: res.user });
      toast.success(mode === 'login' ? 'Bienvenue ! 👋' : 'Compte créé ! 🎉');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(1); setForm({ phone: '', pin: '', name: '' }); setError(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] via-[#1e5c35] to-[#0f2f1a] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-[#FFBE00] flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-4xl">💰</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">{T('welcome')}</h1>
        <p className="text-white/60 mt-1 text-sm">{T('tagline')}</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer ${
                mode === m
                  ? 'text-[#1A4731] border-b-2 border-[#FFBE00]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {T(m)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Step progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#FFBE00]' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-xl font-bold text-[#1A4731]">
                  {mode === 'login' ? T('welcomeBack') : T('createAccount')}
                </h2>
                {mode === 'register' && (
                  <Input
                    label={T('name')}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Mamadou Diallo"
                  />
                )}
                <Input
                  label={T('phone')}
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0622 345 678"
                  prefix="📱"
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center gap-4"
              >
                <h2 className="text-xl font-bold text-[#1A4731] self-start">
                  {mode === 'login' ? 'Entrez votre PIN' : 'Choisissez un PIN'}
                </h2>
                <p className="text-sm text-slate-400 self-start">
                  {mode === 'login' ? `${T('pinFor')} ${form.phone}` : T('choosePinDesc')}
                </p>
                <div className="pt-2">
                  <PinInput value={form.pin} onChange={pin => setForm(f => ({ ...f, pin }))} secret />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 mt-3 text-center"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3 mt-6">
            {step === 2 && (
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                ← Retour
              </Button>
            )}
            <Button
              onClick={handleNext}
              loading={loading}
              fullWidth={step === 1}
              className={step === 2 ? 'flex-1' : ''}
            >
              {step === 1 ? 'Continuer →' : (loading ? T(mode === 'login' ? 'connecting' : 'creating') : T(mode === 'login' ? 'login' : 'register'))}
            </Button>
          </div>
        </div>
      </motion.div>

      <p className="text-white/40 text-xs mt-6">Vos données sont sécurisées 🔒</p>
    </div>
  );
}
