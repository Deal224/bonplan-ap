import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { emojiList } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

// BUG 3 FIX: use i18n keys instead of hardcoded labels
const RULE_TYPES = [
  { value: 'none', labelKey: 'ruleNone', icon: '🔓' },
  { value: 'max_monthly', labelKey: 'ruleMaxMonthly', icon: '📅' },
  { value: 'min_balance', labelKey: 'ruleMinBalance', icon: '🛡️' },
  { value: 'max_amount', labelKey: 'ruleMaxAmount', icon: '💎' },
];

export default function NewObjective() {
  const { state, dispatch } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    emoji: '🎯',
    target_amount: '',
    lock_date: '',
    rule_type: 'none',
    rule_value: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    // BUG 3 FIX: errors via T()
    if (!form.name.trim()) errs.name = T('fillFields');
    if (!form.target_amount || Number(form.target_amount) < 1000) errs.target_amount = T('minAmount');
    if (!form.lock_date) errs.lock_date = T('fillFields');
    else if (new Date(form.lock_date) <= new Date()) errs.lock_date = T('lockDate');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const rule = { type: form.rule_type };
      if (form.rule_type !== 'none' && form.rule_value) {
        rule.value = Number(form.rule_value);
      }

      const res = await api.createObjective({
        name: form.name.trim(),
        emoji: form.emoji,
        target_amount: Number(form.target_amount),
        lock_date: form.lock_date,
        rule,
      });

      // Refresh objectives
      const objRes = await api.getObjectives();
      dispatch({ type: 'SET_OBJECTIVES', objectives: objRes.objectives || [] });

      toast.success('Objectif créé ! 🎉');
      navigate(`/objective/${res.objective.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRule = RULE_TYPES.find(r => r.value === form.rule_type);

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer shadow-sm"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{T('newObjective')}</h1>
          {/* BUG 3 FIX: step label via T() */}
          <p className="text-slate-400 text-sm">{T('step')} {step}/2</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-2">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#1A3C6E]' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col gap-5"
          >
            {/* Emoji picker */}
            <div>
              {/* BUG 3 FIX: icon label via T() */}
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">{T('icon')}</label>
              <div className="grid grid-cols-10 gap-1.5">
                {emojiList().map(e => (
                  <button
                    key={e}
                    onClick={() => set('emoji', e)}
                    className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      form.emoji === e
                        ? 'bg-[#1A3C6E] scale-110 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={T('objectiveName')}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="ex: Vacances, Loyer, Téléphone..."
              error={errors.name}
            />

            <Input
              label={T('targetAmount')}
              type="number"
              value={form.target_amount}
              onChange={e => set('target_amount', e.target.value)}
              placeholder="500 000"
              suffix="GNF"
              error={errors.target_amount}
            />

            <Input
              label={T('lockDate')}
              type="date"
              value={form.lock_date}
              onChange={e => set('lock_date', e.target.value)}
              error={errors.lock_date}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            />

            <Button fullWidth onClick={() => { if (validateStep1()) setStep(2); }}>
              {T('continue')}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col gap-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{T('withdrawalRule')}</h2>
              {/* BUG 3 FIX */}
              <p className="text-sm text-slate-400 mb-4">{T('withdrawalRuleDesc')}</p>

              <div className="flex flex-col gap-3">
                {RULE_TYPES.map(rule => (
                  <button
                    key={rule.value}
                    onClick={() => set('rule_type', rule.value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      form.rule_type === rule.value
                        ? 'border-[#1A3C6E] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{rule.icon}</span>
                    <div>
                      <p className={`font-semibold text-sm ${form.rule_type === rule.value ? 'text-[#1A3C6E]' : 'text-slate-900'}`}>
                        {/* BUG 3 FIX: use T() */}
                        {T(rule.labelKey)}
                      </p>
                    </div>
                    {form.rule_type === rule.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#1A3C6E] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {form.rule_type !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  {/* BUG 3 FIX: labels via T() */}
                  <Input
                    label={
                      form.rule_type === 'max_monthly' ? `${T('ruleMaxMonthly')} (${T('gnf')})` :
                      form.rule_type === 'min_balance' ? `${T('ruleMinBalance')} (${T('gnf')})` :
                      `${T('ruleMaxAmount')} (${T('gnf')})`
                    }
                    type="number"
                    value={form.rule_value}
                    onChange={e => set('rule_value', e.target.value)}
                    placeholder="50 000"
                    suffix={T('gnf')}
                  />
                </motion.div>
              )}
            </div>

            {/* Summary — BUG 3 FIX: all strings via T(), locale-aware */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{T('summary')}</p>
              <div className="flex gap-2 items-center mb-2">
                <span className="text-2xl">{form.emoji}</span>
                <span className="font-bold text-slate-900 dark:text-white">{form.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-400">{T('target')}</p>
                  <p className="font-semibold dark:text-white">
                    {Number(form.target_amount).toLocaleString(state.lang === 'en' ? 'en-GB' : 'fr-FR')} {T('gnf')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">{T('lockedUntilDate')}</p>
                  <p className="font-semibold dark:text-white">
                    {new Date(form.lock_date).toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <Button fullWidth loading={loading} onClick={handleSubmit}>
              🎯 {T('createObjective')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
