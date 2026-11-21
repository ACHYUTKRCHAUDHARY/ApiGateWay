import React, { useState, useEffect } from 'react';
import { auditApi } from '@/services/api';
import { StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { AuditRecord } from '@/types';

export const AuditPage: React.FC = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');
  const { addToast } = useToast();

  const loadRecords = () => {
    setLoading(true);
    auditApi
      .list()
      .then((res) => setRecords(res.data))
      .catch(() => addToast('Failed to load audit records', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filtered = records.filter((r) => {
    const matchesResult = filterResult === 'ALL' || r.result === filterResult;
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.action?.toLowerCase().includes(q) ||
      r.actor?.toLowerCase().includes(q) ||
      r.resourceType?.toLowerCase().includes(q) ||
      r.resourceId?.toLowerCase().includes(q);
    return matchesResult && matchesQuery;
  });

  const successCount = records.filter((r) => r.result === 'SUCCESS').length;
  const failureCount = records.length - successCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#EF4444]">Compliance</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">append-only ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            Control Plane Audit Trail
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Cryptographic ledger tracking administrative mutations and security events
          </p>
        </div>

        <button
          onClick={loadRecords}
          className="px-3.5 py-1.5 rounded-[8px] bg-[var(--surface-2)] text-[var(--navy)] border border-[var(--border)] text-xs font-bold hover:bg-[var(--border-light)] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          ↻ Refresh Ledger
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border border-[var(--border-light)] p-4">
          <span className="label-caps text-[var(--text-muted)] text-[10px]">Total Logged Actions</span>
          <div className="font-mono text-xl font-bold text-[var(--navy)] mt-1">{records.length}</div>
        </div>
        <div className="card border border-[var(--border-light)] p-4">
          <span className="label-caps text-[var(--text-muted)] text-[10px]">Authorized Mutations</span>
          <div className="font-mono text-xl font-bold text-emerald-600 mt-1">{successCount}</div>
        </div>
        <div className="card border border-[var(--border-light)] p-4">
          <span className="label-caps text-[var(--text-muted)] text-[10px]">Rejections & Faults</span>
          <div className="font-mono text-xl font-bold text-rose-600 mt-1">{failureCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
        <input
          type="text"
          placeholder="Filter by action, actor, resource ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-[#1E3354] border border-[var(--border)] text-xs font-mono text-[var(--navy)] focus:outline-none focus:border-[#D4F564] max-w-sm"
        />

        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'SUCCESS', 'FAILURE'].map((res) => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`px-3 py-1.5 rounded-[6px] font-mono text-[11px] font-bold transition-all cursor-pointer ${
                filterResult === res
                  ? 'bg-white dark:bg-[#1E3354] text-[var(--navy)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--navy)]'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} className="h-12 w-full rounded-[8px]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-3">
                      <StatusPill
                        status={r.result}
                        variant={r.result === 'SUCCESS' ? 'green' : 'red'}
                      />
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--navy)] font-sans">{r.action}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">@{r.actor}</td>
                    <td className="py-3 px-3">
                      <span className="text-[var(--text-muted)]">{r.resourceType} : </span>
                      <span className="text-[var(--navy)] font-semibold">{r.resourceId}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text-muted)] truncate max-w-xs">{r.details}</td>
                    <td className="py-3 px-3">{r.durationMs}ms</td>
                    <td className="py-3 px-3 text-right text-[11px] text-[var(--text-muted)]">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
