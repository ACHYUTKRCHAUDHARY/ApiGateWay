import React, { useState, useEffect } from 'react';
import { webhooksApi } from '@/services/api';
import { StatusPill, CopyButton, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Webhook, WebhookDelivery } from '@/types';

export const WebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<string>('wh_01');
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    webhooksApi
      .list()
      .then((data) => {
        setWebhooks(data);
        if (data.length > 0) {
          setSelectedWebhook(data[0].id);
          webhooksApi.deliveries(data[0].id).then(setDeliveries);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectWebhook = (id: string) => {
    setSelectedWebhook(id);
    webhooksApi.deliveries(id).then(setDeliveries);
  };

  const handleResend = (deliveryId: string) => {
    webhooksApi.resend(deliveryId).then(() => {
      addToast(`Webhook delivery event ${deliveryId} re-dispatched to queue`, 'success');
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#3B82F6]">Event Subscriptions</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">HTTP POST Callbacks</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            Merchant Webhooks
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Asynchronous event delivery with HMAC signature verification and auto-retry
          </p>
        </div>

        <button
          onClick={() => addToast('Opening webhook registration drawer', 'info')}
          className="px-4 py-2 rounded-[8px] bg-[#D4F564] text-[var(--navy)] text-xs font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          + Add Webhook Endpoint
        </button>
      </div>

      {loading ? (
        <SkeletonBlock className="h-48 w-full rounded-[16px]" />
      ) : (
        <div className="space-y-6">
          {/* Webhooks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                onClick={() => handleSelectWebhook(wh.id)}
                className={`card border cursor-pointer transition-all ${
                  selectedWebhook === wh.id
                    ? 'border-[#3B82F6] ring-2 ring-blue-500/20'
                    : 'border-[var(--border-light)] hover:border-[var(--border)]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-mono text-xs font-bold text-[var(--navy)] truncate max-w-[280px]">
                    {wh.url}
                  </div>
                  <StatusPill
                    status={wh.active ? 'ACTIVE' : 'PAUSED'}
                    variant={wh.active ? 'green' : 'gray'}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {wh.events.map((ev) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-2)] text-[var(--navy)] border border-[var(--border)] font-mono text-[10px]"
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-[11px] font-mono text-[var(--text-muted)]">
                  <span>Secret: {wh.secret}</span>
                  <CopyButton text={wh.url} />
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Log */}
          <div className="card border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                  Delivery Log for {selectedWebhook}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">Historical delivery attempts, latency, and response status codes</p>
              </div>
              <span className="label-caps text-[var(--text-muted)]">{deliveries.length} attempts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                    <th className="py-2.5 px-3">Delivery ID</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">HTTP Status</th>
                    <th className="py-2.5 px-3">Response Time</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--navy)]">{del.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{del.event}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold"
                          style={{
                            background: del.statusCode === 200 ? '#ECFDF5' : '#FEF2F2',
                            color: del.statusCode === 200 ? '#059669' : '#DC2626',
                          }}
                        >
                          {del.statusCode} {del.statusCode === 200 ? 'OK' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 px-3">{del.responseTimeMs}ms</td>
                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                        {new Date(del.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!del.success && (
                          <button
                            onClick={() => handleResend(del.id)}
                            className="px-2.5 py-1 rounded-[6px] border border-[var(--border)] hover:bg-[var(--surface-2)] text-[11px] font-bold text-[var(--navy)] transition-colors cursor-pointer"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Resend ↺
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
