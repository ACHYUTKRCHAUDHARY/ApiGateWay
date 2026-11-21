import React, { useState, useEffect } from 'react';
import { orgsApi } from '@/services/api';
import { StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Organization } from '@/types';

export const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    orgsApi
      .list()
      .then((res) => setOrganizations(res.data))
      .catch(() => addToast('Failed to load organizations', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const getTierColor = (tier: string) => {
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
          onClick={() => addToast('Opening tenant onboarding modal', 'info')}
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
          {organizations.map((org) => (
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
                    <span className="font-mono text-xs text-[var(--text-muted)]">@{org.name}</span>
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
                      {org.maxRoutesAllowed}
                    </div>
                  </div>
                  <div>
                    <span className="label-caps text-[var(--text-muted)] text-[9px]">Max RPM</span>
                    <div className="font-mono font-bold text-sm text-[var(--navy)] mt-0.5">
                      {org.maxRpmPerRoute}
                    </div>
                  </div>
                  <div>
                    <span className="label-caps text-[var(--text-muted)] text-[9px]">Status</span>
                    <div className="font-mono font-bold text-sm text-emerald-600 mt-0.5">
                      {org.active ? 'ACTIVE' : 'SUSPENDED'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[var(--text-secondary)] font-mono">
                  <div>Contact: {org.contactEmail}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mt-2">
                <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
                <span>ID: #{org.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
