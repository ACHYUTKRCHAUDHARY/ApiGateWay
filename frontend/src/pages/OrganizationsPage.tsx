import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orgsApi } from '@/services/api';
import { StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Organization } from '@/types';

export const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadOrgs = () => {
    setLoading(true);
    orgsApi
      .list()
      .then((res) => setOrganizations(res.data))
      .catch(() => addToast('Failed to load organizations', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setSubmitting(true);
    try {
      await orgsApi.create({
        name: newOrgName.trim(),
        slug: (newOrgSlug || newOrgName).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      });
      addToast(`Tenant organization '${newOrgName}' created!`, 'success');
      setShowModal(false);
      setNewOrgName('');
      setNewOrgSlug('');
      loadOrgs();
    } catch {
      addToast('Failed to create organization', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTierColor = (tier: string = 'ENTERPRISE') => {
    switch (tier?.toUpperCase()) {
      case 'ENTERPRISE': return 'green';
      case 'STARTER': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#059669]">Multi-Tenancy</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">IAM Partitioning</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            Organizations & Tenants
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Tenant isolation, route allocation quotas, and throughput tier management
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] text-xs font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          + Provision Tenant
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-44 rounded-[16px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {organizations.map((org) => {
            const isActive = org.status === 'ACTIVE' || org.active;
            return (
              <div
                key={org.id}
                className="card flex flex-col justify-between border border-[var(--border-light)]"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                        {org.displayName || org.name}
                      </h2>
                      <span className="font-mono text-xs text-[var(--text-muted)]">@{org.slug || org.name}</span>
                    </div>
                    <StatusPill
                      status={org.tier || 'ENTERPRISE'}
                      variant={getTierColor(org.tier) as any}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] my-4 text-center">
                    <div>
                      <span className="label-caps text-[var(--text-muted)] text-[9px]">Max Routes</span>
                      <div className="font-mono font-bold text-sm text-[var(--navy)] mt-0.5">
                        {org.maxRoutesAllowed || 50}
                      </div>
                    </div>
                    <div>
                      <span className="label-caps text-[var(--text-muted)] text-[9px]">Max RPM</span>
                      <div className="font-mono font-bold text-sm text-[var(--navy)] mt-0.5">
                        {org.maxRpmPerRoute || 5000}
                      </div>
                    </div>
                    <div>
                      <span className="label-caps text-[var(--text-muted)] text-[9px]">Status</span>
                      <div className={`font-mono font-bold text-sm mt-0.5 ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[var(--text-secondary)] font-mono">
                    <div>Contact: {org.contactEmail || `admin@${org.slug || 'org'}.dev`}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mt-2">
                  <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
                  <span>ID: #{org.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision Tenant Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#14203A] rounded-[16px] p-6 shadow-2xl border border-[var(--border)] z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-base font-extrabold text-[var(--navy)] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
                  Provision Tenant Organization
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
                <div>
                  <label className="block label-caps text-[var(--text-secondary)] mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme FinTech Corp"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      if (!newOrgSlug) {
                        setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block label-caps text-[var(--text-secondary)] mb-1">Tenant Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. acme-fintech"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-[8px] border border-[var(--border)] font-semibold hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Provisioning...' : 'Provision Tenant'}
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
