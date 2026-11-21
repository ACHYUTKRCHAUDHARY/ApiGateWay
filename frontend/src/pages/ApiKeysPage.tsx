import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { apiKeysApi } from '@/services/api';
import { CopyButton, StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { ApiKey } from '@/types';

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  useEffect(() => {
    apiKeysApi
      .list()
      .then(setKeys)
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmRotate = async () => {
    if (!rotatingKey) return;
    setIsRotating(true);
    try {
      const updated = await apiKeysApi.rotate(rotatingKey.id);
      setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
      addToast(`API Key for ${rotatingKey.label} successfully rotated`, 'success');
      setRotatingKey(null);
    } catch {
      addToast('Failed to rotate API Key', 'error');
    } finally {
      setIsRotating(false);
    }
  };

  const liveKeys = keys.filter((k) => k.environment === 'live');
  const testKeys = keys.filter((k) => k.environment === 'test');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#F5B301]">Credentials</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">Bearer Auth</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            API Keys & Authentication
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage public client keys and restricted merchant server credentials
          </p>
        </div>

        <button
          onClick={() => addToast('Opening credential generation wizard', 'info')}
          className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] text-xs font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          + Generate New Key
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-32 w-full rounded-[16px]" />
          <SkeletonBlock className="h-32 w-full rounded-[16px]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Keys Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <h2 className="label-caps text-[var(--navy)] text-xs tracking-wider">
                Production Live Keys
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {liveKeys.map((key) => (
                <div
                  key={key.id}
                  className="card flex flex-col justify-between border border-[var(--border-light)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                        {key.label}
                      </h3>
                      <StatusPill status="LIVE" variant="green" />
                    </div>

                    <div className="p-2.5 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between my-3">
                      <span className="font-mono text-xs text-[var(--navy)] font-semibold">
                        {key.maskedKey}
                      </span>
                      <CopyButton text={key.maskedKey} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-[11px] text-[var(--text-muted)] font-mono">
                    <span>Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
                    <button
                      onClick={() => setRotatingKey(key)}
                      className="px-2.5 py-1 rounded-[6px] border border-[#F97316] text-[#F97316] hover:bg-orange-50 dark:hover:bg-orange-950/20 font-bold text-[11px] transition-colors cursor-pointer"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Rotate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Keys Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F5B301]" />
              <h2 className="label-caps text-[var(--navy)] text-xs tracking-wider">
                Sandbox & Test Keys
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {testKeys.map((key) => (
                <div
                  key={key.id}
                  className="card flex flex-col justify-between border border-[var(--border-light)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                        {key.label}
                      </h3>
                      <StatusPill status="SANDBOX" variant="amber" />
                    </div>

                    <div className="p-2.5 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between my-3">
                      <span className="font-mono text-xs text-[var(--navy)] font-semibold">
                        {key.maskedKey}
                      </span>
                      <CopyButton text={key.maskedKey} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-[11px] text-[var(--text-muted)] font-mono">
                    <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => setRotatingKey(key)}
                      className="px-2.5 py-1 rounded-[6px] border border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-[11px] transition-colors cursor-pointer"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Rotate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rotate Confirmation Modal */}
      <AnimatePresence>
        {rotatingKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRotating && setRotatingKey(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#14203A] rounded-[16px] p-6 shadow-2xl border border-[var(--border)] z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--navy)] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    Rotate API Credential?
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Target: {rotatingKey.label} ({rotatingKey.prefix}...)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                Rotating this key will invalidate the current key immediately. Any in-flight requests or external merchant services using this secret will fail until updated.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  disabled={isRotating}
                  onClick={() => setRotatingKey(null)}
                  className="px-4 py-2 rounded-[8px] border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Cancel
                </button>
                <button
                  disabled={isRotating}
                  onClick={handleConfirmRotate}
                  className="px-4 py-2 rounded-[8px] bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {isRotating ? 'Rotating...' : 'Rotate Key Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
