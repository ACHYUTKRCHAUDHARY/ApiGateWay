import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { routesApi, gatewayApi } from '@/services/api';
import { StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Route, CreateRouteRequest } from '@/types';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  // Create form state
  const [formData, setFormData] = useState<CreateRouteRequest>({
    name: '',
    pathPattern: '',
    targetBaseUrl: '',
    targetPathPrefix: '',
    requestsPerMinute: 600,
    responseTimeoutMs: 5000,
    idempotencyEnabled: false,
    allowedMethods: ['GET', 'POST'],
  });

  const loadRoutes = () => {
    setLoading(true);
    routesApi
      .list(search)
      .then((res) => setRoutes(res.data))
      .catch(() => addToast('Failed to load routes from control plane', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoutes();
  }, [search]);

  const handleToggle = async (id: number) => {
    try {
      await routesApi.toggle(id);
      addToast('Route state toggled successfully', 'success');
      loadRoutes();
    } catch {
      addToast('Failed to toggle route', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this route from the smart gateway?')) return;
    try {
      await routesApi.delete(id);
      addToast('Route deleted', 'success');
      loadRoutes();
    } catch {
      addToast('Failed to delete route', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await routesApi.create(formData);
      addToast('New route registered with Smart Gateway', 'success');
      setShowCreateModal(false);
      gatewayApi.sync().catch(() => {});
      loadRoutes();
    } catch (err: any) {
      addToast(err.message || 'Failed to create route', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#F97316]">Data Plane</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">reverse proxy</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            API Gateway Routes
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure dynamic upstream routing rules, rate limit quotas, and header mutation policies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-[8px] border border-[var(--border)] text-xs font-mono bg-[var(--surface-2)] text-[var(--navy)] focus:outline-none focus:border-[#D4F564]"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] text-xs font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            + Create Route
          </button>
        </div>
      </div>

      {/* Routes Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-12 w-full rounded-[8px]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Pattern</th>
                  <th className="py-3 px-3">Target URL</th>
                  <th className="py-3 px-3">RPM Limit</th>
                  <th className="py-3 px-3">Methods</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {routes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--navy)] font-sans">{rt.name}</td>
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                      {rt.pathPattern}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] truncate max-w-xs">
                      {rt.targetBaseUrl}
                    </td>
                    <td className="py-3 px-3">{rt.requestsPerMinute} / min</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        {(rt.allowedMethods || ['*']).map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 rounded-[3px] bg-[var(--surface-2)] text-[10px] font-bold border border-[var(--border)]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill
                        status={rt.active ? 'ACTIVE' : 'INACTIVE'}
                        variant={rt.active ? 'green' : 'red'}
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(rt.id)}
                          className="px-2.5 py-1 rounded-[6px] border border-[var(--border)] hover:bg-[var(--surface-2)] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {rt.active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(rt.id)}
                          className="px-2.5 py-1 rounded-[6px] border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Route Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#14203A] rounded-[16px] p-6 shadow-2xl border border-[var(--border)] z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-base font-extrabold text-[var(--navy)] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
                  Create Gateway Route
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block label-caps text-[var(--text-secondary)] mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payments Service Route"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block label-caps text-[var(--text-secondary)] mb-1">Path Pattern</label>
                    <input
                      type="text"
                      required
                      placeholder="/api/v1/payments/**"
                      value={formData.pathPattern}
                      onChange={(e) => setFormData({ ...formData, pathPattern: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block label-caps text-[var(--text-secondary)] mb-1">Target Base URL</label>
                    <input
                      type="text"
                      required
                      placeholder="http://localhost:8081"
                      value={formData.targetBaseUrl}
                      onChange={(e) => setFormData({ ...formData, targetBaseUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block label-caps text-[var(--text-secondary)] mb-1">Rate Limit (RPM)</label>
                    <input
                      type="number"
                      required
                      value={formData.requestsPerMinute}
                      onChange={(e) => setFormData({ ...formData, requestsPerMinute: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block label-caps text-[var(--text-secondary)] mb-1">Response Timeout (ms)</label>
                    <input
                      type="number"
                      required
                      value={formData.responseTimeoutMs}
                      onChange={(e) => setFormData({ ...formData, responseTimeoutMs: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-[8px] border border-[var(--border)] font-semibold hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer"
                  >
                    Save & Deploy Route
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
