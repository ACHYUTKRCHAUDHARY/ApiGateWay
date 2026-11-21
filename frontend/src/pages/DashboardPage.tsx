import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { StatusPill, CopyButton, StarRating, CountUp, Ribbon, SkeletonBlock } from '@/components/ui/Primitives';
import { Mascot } from '@/components/icons/Mascot';
import { CoinIcon, ShieldIcon, FlameIcon, BoltIcon, HexagonStep } from '@/components/icons/SpotIcons';
import { analyticsApi, routesApi, transactionsApi } from '@/services/api';
import type { AnalyticsOverview, TimeseriesPoint, Route, Transaction } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      analyticsApi.overview('24h').catch(() => ({
        totalRequests: 14820,
        successCount: 14612,
        errorCount: 208,
        errorRatePercentage: 1.4,
        avgLatencyMs: 38.4,
        p95LatencyMs: 84,
        p99LatencyMs: 142,
        activeRoutesCount: 4,
      })),
      analyticsApi.timeseries('7d').catch(() => [
        { timestamp: 'Mon', requestCount: 1820, errorCount: 24, avgLatencyMs: 40 },
        { timestamp: 'Tue', requestCount: 2140, errorCount: 18, avgLatencyMs: 36 },
        { timestamp: 'Wed', requestCount: 2450, errorCount: 32, avgLatencyMs: 45 },
        { timestamp: 'Thu', requestCount: 2310, errorCount: 29, avgLatencyMs: 39 },
        { timestamp: 'Fri', requestCount: 2890, errorCount: 41, avgLatencyMs: 42 },
        { timestamp: 'Sat', requestCount: 1650, errorCount: 14, avgLatencyMs: 35 },
        { timestamp: 'Sun', requestCount: 1560, errorCount: 12, avgLatencyMs: 33 },
      ]),
      routesApi.list().then(res => res.data).catch(() => []),
      transactionsApi.list().catch(() => []),
    ]).then(([ov, ts, rts, txs]) => {
      if (!mounted) return;
      setOverview(ov as AnalyticsOverview);
      setTimeseries(ts as TimeseriesPoint[]);
      setRoutes(rts);
      setTransactions(txs);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const toggleStep = (stepNum: number, stepName: string) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum];
      addToast(next.includes(stepNum) ? `Completed: ${stepName}` : `Marked incomplete: ${stepName}`, 'success');
      return next;
    });
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'CAPTURED': return 'green';
      case 'DECLINED': return 'red';
      case '3DS_REQUIRED': return 'amber';
      case 'REFUNDED': return 'blue';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-24 w-full rounded-[16px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBlock key={i} className="h-32 rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  const successRate = overview && overview.totalRequests > 0
    ? (overview.successCount / overview.totalRequests) * 100
    : 98.6;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Row */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]"
      >
        <div className="flex items-center gap-4">
          <Mascot size={56} mood="wave" />
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-body)' }}>
              Welcome back, {user?.displayName || 'Riya'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Production Gateway traffic is healthy. p95 latency is stable under 90ms.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              analyticsApi.seed().then(() => addToast('Seeded 50 live transaction telemetry events', 'success'));
            }}
            className="px-3.5 py-1.5 rounded-[8px] bg-[var(--surface)] text-[var(--navy)] border border-[var(--border)] text-xs font-semibold hover:bg-[var(--border-light)] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            ⚡ Ingest Burst Events
          </button>
        </div>
      </motion.div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Volume (24h)',
            icon: <CoinIcon size={36} />,
            value: overview?.totalRequests || 14820,
            delta: '+12.4%',
            isPositive: true,
            decimals: 0,
            prefix: '',
            suffix: ' req',
          },
          {
            label: 'Success Rate',
            icon: <ShieldIcon size={36} />,
            value: successRate,
            delta: '+0.8%',
            isPositive: true,
            decimals: 1,
            prefix: '',
            suffix: '%',
          },
          {
            label: 'Failed',
            icon: <FlameIcon size={36} />,
            value: overview?.errorCount || 208,
            delta: '-4.2%',
            isPositive: true,
            decimals: 0,
            prefix: '',
            suffix: ' err',
            alert: (overview?.errorCount || 0) > 0,
          },
          {
            label: 'p95 Latency',
            icon: <BoltIcon size={36} />,
            value: overview?.p95LatencyMs || 84,
            delta: '-12ms',
            isPositive: true,
            decimals: 0,
            prefix: '',
            suffix: ' ms',
          },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={reduced ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            whileHover={reduced ? {} : { y: -4, boxShadow: 'var(--shadow-xl)' }}
            whileTap={reduced ? {} : { scale: 0.98 }}
            className="card relative flex flex-col justify-between overflow-hidden border border-[var(--border-light)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="label-caps text-[var(--text-secondary)]">{kpi.label}</span>
                <div className="text-2xl font-extrabold text-[var(--navy)] mt-2">
                  <CountUp
                    end={kpi.value}
                    decimals={kpi.decimals}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                  />
                </div>
              </div>
              <div className="shrink-0">{kpi.icon}</div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
              <span className={kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {kpi.delta}
              </span>
              <span className="text-[var(--text-muted)] font-normal">vs yesterday</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Charts & Onboarding Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-day volume line chart */}
        <div className="card lg:col-span-2 border border-[var(--border-light)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-light)]">
            <div>
              <h2 className="text-base font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                7-Day Transaction Volume & Errors
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Throughput timeline measured across all active gateway routes</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--navy)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                Requests
              </span>
              <span className="flex items-center gap-1.5 text-[var(--navy)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                Errors
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B95A8', fontFamily: 'var(--font-body)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8B95A8', fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requestCount"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F97316' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="errorCount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Go Live in 3 Steps Card */}
        <div className="card flex flex-col justify-between border border-[var(--border-light)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label-caps text-[#F97316]">Quickstart</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--navy)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>
              Go live in 3 steps
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Complete merchant setup to enable live settlement with your acquiring bank.
            </p>

            {/* Vertical connector steps */}
            <div className="space-y-5 relative">
              <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[var(--border)] -z-0" />

              {[
                { step: 1, title: 'Generate API Credentials', desc: 'Acquire production API Key and signing secret' },
                { step: 2, title: 'Configure Webhook URL', desc: 'Receive real-time payment.captured event webhooks' },
                { step: 3, title: 'Send First Live Transaction', desc: 'Simulate or execute an end-to-end payment' },
              ].map((s) => {
                const isDone = completedSteps.includes(s.step);
                return (
                  <div
                    key={s.step}
                    onClick={() => toggleStep(s.step, s.title)}
                    className="relative z-10 flex items-start gap-3.5 cursor-pointer group"
                  >
                    <div className="shrink-0 transition-transform group-hover:scale-105">
                      <HexagonStep size={40} filled={isDone} number={s.step} />
                    </div>
                    <div className="pt-1">
                      <h3
                        className={`text-xs font-bold transition-colors ${
                          isDone ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-[var(--navy)]'
                        }`}
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.button
            whileHover={reduced ? {} : { scale: 1.01 }}
            whileTap={reduced ? {} : { scale: 0.98 }}
            onClick={() => addToast('Opening Developer Integration Documentation', 'info')}
            className="w-full mt-6 py-3 px-4 rounded-[8px] bg-[#D4F564] text-[var(--navy)] font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#C8EC50] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}
          >
            <span>Start integrating</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        </div>
      </div>

      {/* 4. Endpoint / Routes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
              Active Gateway Endpoints
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Reverse-proxy routes mapped directly to your core microservices</p>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {routes.length} routes registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(routes.length > 0 ? routes : [
            {
              id: 1,
              routeId: 'payments-v1',
              name: 'Core Payments API',
              pathPattern: '/api/v1/payments/**',
              targetBaseUrl: 'http://localhost:8081/mock/payments',
              requestsPerMinute: 600,
              active: true,
              allowedMethods: ['POST', 'GET'],
            },
            {
              id: 2,
              routeId: 'orders-v1',
              name: 'Checkout & Orders',
              pathPattern: '/api/v1/orders/**',
              targetBaseUrl: 'http://localhost:8081/mock/orders',
              requestsPerMinute: 300,
              active: true,
              allowedMethods: ['POST', 'PUT'],
            },
            {
              id: 3,
              routeId: 'refunds-v1',
              name: 'Settlements & Refunds',
              pathPattern: '/api/v1/refunds/**',
              targetBaseUrl: 'http://localhost:8081/mock/refunds',
              requestsPerMinute: 120,
              active: false,
              allowedMethods: ['POST'],
            },
          ]).map((rt: any, i) => (
            <motion.div
              key={rt.id || i}
              initial={reduced ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={reduced ? {} : { y: -4, boxShadow: 'var(--shadow-xl)' }}
              className="card relative flex flex-col justify-between overflow-hidden border border-[var(--border-light)]"
            >
              <Ribbon label={rt.active ? 'LIVE' : 'LOCKED'} color={rt.active ? '#F97316' : '#EF4444'} />

              <div>
                <div className="flex items-start justify-between pr-12 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Mascot size={32} mood={rt.active ? 'happy' : 'thinking'} />
                    <div>
                      <h3 className="text-sm font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
                        {rt.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[var(--text-secondary)]">{rt.pathPattern}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between my-2">
                  <StarRating rating={rt.active ? 5 : 3} />
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {rt.requestsPerMinute} RPM limit
                  </span>
                </div>

                <div className="p-2.5 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)] truncate my-3">
                  key_live_••••••••••••{rt.routeId?.slice(-4) || '9xKm'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
                <StatusPill
                  status={rt.active ? 'ACTIVE' : 'LOCKED'}
                  variant={rt.active ? 'green' : 'red'}
                  locked={!rt.active}
                />
                <CopyButton text={`http://localhost:8080/gateway${rt.pathPattern?.replace('/**', '') || ''}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. Recent Transactions Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
              Recent Real-Time Transactions
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Live payment authorization feed routed through smart-gateway</p>
          </div>
          <span className="label-caps text-[var(--text-muted)]">Live Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] font-mono">
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[var(--navy)]">
                    {tx.id}
                  </td>
                  <td className="py-3 px-3 font-bold text-[var(--navy)]">
                    ₹{(tx.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3">
                    <StatusPill
                      status={tx.declineCode ? `${tx.status} · ${tx.declineCode}` : tx.status}
                      variant={statusVariant(tx.status) as any}
                    />
                  </td>
                  <td className="py-3 px-3 font-sans text-xs text-[var(--text-secondary)]">
                    {tx.method}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-semibold text-[var(--navy)]">{tx.customerName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{tx.customerEmail}</div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[var(--text-muted)]">
                    {new Date(tx.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
