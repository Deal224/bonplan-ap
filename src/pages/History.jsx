import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../lib/store';
import { useLang } from '../lib/i18n';
import { api } from '../lib/api';
import { formatAmount, formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export default function History() {
  const { state } = useApp();
  const T = useLang(state.lang);
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('transactions');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [txRes, payRes] = await Promise.all([
        api.getTransactions(),
        api.getPayments(),
      ]);
      setTransactions(txRes.transactions || []);
      setPayments(payRes.payments || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const items = tab === 'transactions' ? transactions : payments;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{T('transactions')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">Toutes vos opérations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
        {[
          { key: 'transactions', label: 'Transactions' },
          { key: 'payments', label: 'Paiements Mobile Money' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500 font-medium">{T('noTransactions')}</p>
          <p className="text-slate-400 text-sm mt-1">Vos opérations apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                tab === 'payments'
                  ? item.status === 'success' ? 'bg-emerald-100 text-emerald-600'
                    : item.status === 'pending' ? 'bg-amber-100 text-amber-600'
                    : 'bg-red-100 text-red-600'
                  : item.type === 'deposit' ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {tab === 'payments'
                  ? item.status === 'success' ? '✓' : item.status === 'pending' ? '⏳' : '✕'
                  : item.type === 'deposit' ? '↑' : '↓'
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {tab === 'payments'
                    ? `Paiement Mobile Money`
                    : item.type === 'deposit' ? 'Dépôt' : 'Retrait'
                  }
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(item.created_at)}
                  {tab === 'payments' && item.provider && ` · ${item.provider}`}
                  {item.note && ` · ${item.note}`}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${
                  tab === 'payments' ? 'text-slate-900'
                  : item.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {tab === 'transactions' && (item.type === 'deposit' ? '+' : '-')}
                  {formatAmount(item.amount)} GNF
                </p>
                {tab === 'payments' && (
                  <span className={`text-xs ${
                    item.status === 'success' ? 'text-emerald-500'
                    : item.status === 'pending' ? 'text-amber-500'
                    : 'text-red-500'
                  }`}>
                    {item.status === 'success' ? 'Réussi' : item.status === 'pending' ? 'En attente' : 'Échoué'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
