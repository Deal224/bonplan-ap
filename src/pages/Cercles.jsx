import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { emojiList } from '../lib/utils';
import { CercleCard } from '../components/CercleCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

const CERCLE_EMOJIS = ['🤝', '👨‍👩‍👧‍👦', '💼', '🏘️', '🌍', '🎓', '💒', '🏋️', '🎯', '🌱'];

export default function Cercles() {
  const { state } = useApp();
  const T = useLang(state.lang);
  const navigate = useNavigate();
  const toast = useToast();

  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', emoji: '🤝', target_amount: '', lock_date: '', member_target: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getTontines();
      setTontines(res.tontines || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = T('fillFields');
    if (!form.target_amount || Number(form.target_amount) < 1000) errs.target_amount = T('minAmount');
    if (!form.lock_date) errs.lock_date = T('fillFields');
    else if (new Date(form.lock_date) <= new Date()) errs.lock_date = T('lockDate');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setCreating(true);
    try {
      const res = await api.createTontine({
        name: form.name.trim(),
        emoji: form.emoji,
        target_amount: parseInt(form.target_amount, 10),
        lock_date: form.lock_date,
        ...(form.member_target ? { member_target: parseInt(form.member_target, 10) } : {}),
      });
      toast.success(T('cercleCreated'));
      setCreateModal(false);
      setForm({ name: '', emoji: '🤝', target_amount: '', lock_date: '', member_target: '' });
      navigate(`/cercle/${res.tontine.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T('cercles')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{T('cerclesDesc')}</p>
        </div>
        <Button size="sm" onClick={() => setCreateModal(true)}>
          + {T('createCercle')}
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : tontines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{T('noCercles')}</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{T('noCerclesDesc')}</p>
          <Button className="mt-6" onClick={() => setCreateModal(true)}>
            {T('createCercle')}
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {tontines.map((t, i) => (
            <CercleCard
              key={t.id}
              tontine={t}
              index={i}
              onClick={() => navigate(`/cercle/${t.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title={T('createCercle')}>
        <div className="flex flex-col gap-4">
          {/* Emoji picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">{T('icon')}</label>
            <div className="grid grid-cols-10 gap-1.5">
              {CERCLE_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => set('emoji', e)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    form.emoji === e
                      ? 'bg-violet-600 scale-110 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={T('cercleName')}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: Famille Diallo, Amis bureau..."
            error={errors.name}
          />
          <Input
            label={T('cercleTarget')}
            type="number"
            value={form.target_amount}
            onChange={e => set('target_amount', e.target.value)}
            placeholder="1 000 000"
            suffix="GNF"
            error={errors.target_amount}
          />
          <Input
            label={T('memberTarget') + ' (optionnel)'}
            type="number"
            value={form.member_target}
            onChange={e => set('member_target', e.target.value)}
            placeholder="Votre cotisation cible"
            suffix="GNF"
          />
          <Input
            label={T('lockDate')}
            type="date"
            value={form.lock_date}
            onChange={e => set('lock_date', e.target.value)}
            error={errors.lock_date}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          />

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setCreateModal(false)} className="flex-1">
              {T('cancel')}
            </Button>
            <Button loading={creating} onClick={handleCreate} className="flex-1"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}>
              🤝 {T('createCercle')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
