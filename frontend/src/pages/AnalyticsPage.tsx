import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { analyticsApi } from '@/services/api';
import { CountUp, SkeletonBlock, StatusPill } from '@/components/ui/Primitives';
import { CoinIcon, ShieldIcon, FlameIcon, BoltIcon } from '@/components/icons/SpotIcons';
import type { AnalyticsOverview, TimeseriesPoint, RouteMetrics, StatusCodeCount, AccessLog } from '@/types';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics[]>([]);
  const [statusCodes, setStatusCodes] = useState<StatusCodeCount[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.overview(timeRange).catch(() => null),
      analyticsApi.timeseries(timeRange).catch(() => []),
      analyticsApi.routeMetrics(timeRange).catch(() => []),
      analyticsApi.statusCodes(timeRange).catch(() => []),
      analyticsApi.logs(20).catch(() => []),
    ]).then(([ov, ts, rm, sc, lg]) => {
      setOverview(ov);
      setTimeseries(ts);
      setRouteMetrics(rm);
      setStatusCodes(sc);
      setLogs(lg);
      setLoading(false);
    });
  }, [timeRange]);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return '#34D399';
    if (code >= 300 && code < 400) return '#3B82F6';
    if (code >= 400 && code < 500) return '#F5B301';
    return '#EF4444';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Range Filter */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#F97316]">Observability</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">P95 / P99 telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            Gateway Analytics & Metrics
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Continuous performance profiling ingested by analytics-service
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)]">
          {['1h', '6h', '24h', '7d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-white dark:bg-[#1E3354] text-[var(--navy)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--navy)]'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Requests',
            icon: <CoinIcon size={34} />,
            value: overview?.totalRequests || 0,
            suffix: ' req',
            decimals: 0,
          },
          {
            label: 'Average Latency',
            icon: <BoltIcon size={34} />,
            value: overview?.avgLatencyMs || 0,
            suffix: ' ms',
            decimals: 1,
          },
          {
            label: 'Error Rate',
            icon: <FlameIcon size={34} />,
            value: overview?.errorRatePercentage || 0,
            suffix: '%',
            decimals: 2,
          },
          {
            label: 'P95 Latency',
            icon: <ShieldIcon size={34} />,
            value: overview?.p95LatencyMs || 0,
            suffix: ' ms',
            decimals: 0,
          },
        ].map((kpi, idx) => (
          <div key={kpi.label} className="card flex items-start justify-between border border-[var(--border-light)]">
            <div>
              <span className="label-caps text-[var(--text-secondary)]">{kpi.label}</span>
              <div className="text-2xl font-extrabold text-[var(--navy)] mt-2">
                <CountUp end={kpi.value} decimals={kpi.decimals} suffix={kpi.suffix} />
              </div>
            </div>
            <div>{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput */}
        <div className="card border border-[var(--border-light)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
              Throughput & Error Distribution
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--navy)] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                Requests
              </span>
              <span className="flex items-center gap-1.5 text-[var(--navy)] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                Errors
              </span>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B95A8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B95A8', fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <Line type="monotone" dataKey="requestCount" stroke="#F97316" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="errorCount" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Codes */}
        <div className="card border border-[var(--border-light)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-light)]">
            <h2 className="text-sm font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
              HTTP Status Breakdown
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Status counts</span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCodes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="statusCode" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B95A8', fontFamily: 'var(--font-mono)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8B95A8', fontFamily: 'var(--font-mono)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusCodes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.statusCode)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Route Metrics Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        <h2 className="text-sm font-bold text-[var(--navy)] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          Route Performance Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                <th className="py-2.5 px-3">Route Identifier</th>
                <th className="py-2.5 px-3">Total Requests</th>
                <th className="py-2.5 px-3">Faults / Errors</th>
                <th className="py-2.5 px-3">Mean Latency</th>
                <th className="py-2.5 px-3">P95 Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {routeMetrics.map((rm) => (
                <tr key={rm.routeId} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--navy)]">{rm.routeId}</td>
                  <td className="py-3 px-3">{rm.totalRequests.toLocaleString()}</td>
                  <td className="py-3 px-3 text-rose-600 font-semibold">{rm.errorCount}</td>
                  <td className="py-3 px-3">{rm.avgLatencyMs.toFixed(1)}ms</td>
                  <td className="py-3 px-3 font-bold text-[var(--navy)]">{rm.p95LatencyMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Access Logs Table */}
      <div className="card overflow-hidden border border-[var(--border-light)]">
        <h2 className="text-sm font-bold text-[var(--navy)] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          Real-time Ingest Log Stream
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] label-caps">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Path</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id || log.requestId} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold"
                      style={{
                        background: log.statusCode < 400 ? '#ECFDF5' : '#FEF2F2',
                        color: log.statusCode < 400 ? '#059669' : '#DC2626',
                      }}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[var(--navy)]">{log.httpMethod}</td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)] truncate max-w-xs">{log.requestPath}</td>
                  <td className="py-2.5 px-3">{log.latencyMs}ms</td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-[var(--text-muted)]">
                    {new Date(log.timestamp).toLocaleTimeString()}
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
