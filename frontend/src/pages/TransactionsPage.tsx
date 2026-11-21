import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { transactionsApi, analyticsApi } from '@/services/api';
import { StatusPill, CopyButton, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Transaction } from '@/types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  const loadData = () => {
    setLoading(true);
    transactionsApi
      .list()
      .then((data) => setTransactions(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    return tx.status === filter;
  });

  const getVariant = (status: string) => {
    switch (status) {
      case 'CAPTURED': return 'green';
      case 'DECLINED': return 'red';
      case '3DS_REQUIRED': return 'amber';
      case 'REFUNDED': return 'blue';
      case 'FAILED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#059669]">Ledger</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">live stream</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            Payment Transactions
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Inspect real-time authorizations, capture settlement states, and raw gateway logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              analyticsApi.seed().then(() => {
                addToast('Ingested sample transaction event batch', 'success');
                loadData();
              });
            }}
            className="px-3.5 py-1.5 rounded-[8px] bg-[#D4F564] text-[var(--navy)] text-xs font-bold hover:bg-[#C8EC50] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            + Ingest New Events
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] w-fit overflow-x-auto max-w-full">
        {['ALL', 'CAPTURED', 'DECLINED', '3DS_REQUIRED', 'PENDING', 'REFUNDED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-white dark:bg-[#1E3354] text-[var(--navy)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--navy)]'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBlock key={i} className="h-12 w-full rounded-[8px]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] font-mono">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-bold text-[var(--navy)] group-hover:text-blue-600">
                      {tx.id}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{tx.orderId}</td>
                    <td className="py-3 px-3 font-bold text-[var(--navy)]">
                      ₹{(tx.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill
                        status={tx.declineCode ? `${tx.status} · ${tx.declineCode}` : tx.status}
                        variant={getVariant(tx.status) as any}
                      />
                    </td>
                    <td className="py-3 px-3 font-sans text-xs text-[var(--text-secondary)]">
                      {tx.method}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-[var(--navy)]">{tx.customerName}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{tx.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] text-[var(--text-muted)]">
                      {new Date(tx.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={reduced ? { opacity: 0 } : { x: 450 }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: 450 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white dark:bg-[#14203A] h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-6 border-l border-[var(--border)]"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div>
                    <span className="label-caps text-[#F97316]">Transaction Detail</span>
                    <h2 className="text-lg font-mono font-bold text-[var(--navy)] dark:text-white mt-0.5">
                      {selectedTx.id}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-[12px] bg-[var(--surface)] dark:bg-[#0B1220] border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="label-caps text-[var(--text-muted)]">Total Amount</span>
                      <div className="text-2xl font-mono font-extrabold text-[var(--navy)] dark:text-white mt-1">
                        ₹{(selectedTx.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <StatusPill
                      status={selectedTx.status}
                      variant={getVariant(selectedTx.status) as any}
                    />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Order Reference</span>
                      <span className="font-mono font-bold text-[var(--navy)] dark:text-white">{selectedTx.orderId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Payment Instrument</span>
                      <span className="font-semibold text-[var(--navy)] dark:text-white">{selectedTx.method}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Customer Name</span>
                      <span className="font-semibold text-[var(--navy)] dark:text-white">{selectedTx.customerName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Customer Email</span>
                      <span className="font-mono text-[var(--navy)] dark:text-white">{selectedTx.customerEmail}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Gateway Request ID</span>
                      <span className="font-mono text-[var(--navy)] dark:text-white">{selectedTx.gatewayRequestId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[var(--text-secondary)]">Authorization Time</span>
                      <span className="font-mono text-[var(--navy)] dark:text-white">
                        {new Date(selectedTx.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </span>
                    </div>
                  </div>

                  {/* Raw JSON viewer */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="label-caps text-[var(--text-secondary)]">Raw Gateway Telemetry JSON</span>
                      <CopyButton text={JSON.stringify(selectedTx, null, 2)} />
                    </div>
                    <pre className="p-3.5 rounded-[8px] bg-[#0B1220] text-emerald-400 font-mono text-[11px] overflow-x-auto border border-gray-800 max-h-56 leading-relaxed">
                      {JSON.stringify(selectedTx, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 rounded-[8px] bg-[var(--surface)] text-[var(--navy)] font-bold text-xs hover:bg-[var(--border-light)] transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
