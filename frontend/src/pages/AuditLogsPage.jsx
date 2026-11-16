import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, ShieldAlert, CheckCircle2, Clock, User, Layers, RefreshCw } from 'lucide-react';

export const AuditLogsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuditRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditRecords();
      if (res && res.data) {
        setRecords(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditRecords();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Control Plane Audit Records</h1>
          <p className="text-sm text-slate-400">
            Immutable security ledger tracking every administrative action, route mutation & policy change
          </p>
        </div>

        <button
          onClick={loadAuditRecords}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Audit Ledger</span>
        </button>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Resource</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {records && records.length > 0 ? (
                records.map((r) => {
                  const isSuccess = r.result === 'SUCCESS';
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {r.result}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-bold text-cyan-400">{r.action}</td>

                      <td className="py-2.5 px-3 text-slate-200">
                        <span className="text-slate-300 font-semibold">{r.actor}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-slate-400 font-sans">{r.resourceType} : </span>
                        <span className="text-indigo-300 font-mono font-bold">{r.resourceId}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-sm">{r.details}</td>

                      <td className="py-2.5 px-3 text-slate-400">{r.durationMs} ms</td>

                      <td className="py-2.5 px-3 text-slate-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No audit records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

