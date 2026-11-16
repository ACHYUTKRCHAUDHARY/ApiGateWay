import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [overview, setOverview] = useState(null);
  const [routeMetrics, setRouteMetrics] = useState([]);
  const [statusCodes, setStatusCodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filterRoute, setFilterRoute] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [ov, rm, sc, lg] = await Promise.all([
        api.getAnalyticsOverview(timeRange),
        api.getAnalyticsRoutes(timeRange),
        api.getAnalyticsStatusCodes(timeRange),
        api.getAnalyticsLogs(filterRoute, filterStatus, 100)
      ]);

      setOverview(ov);
      setRouteMetrics(rm);
      setStatusCodes(sc);
      setLogs(lg);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, filterRoute, filterStatus]);

  const handleSeed = async () => {
    await api.seedSampleAnalytics();
    fetchData();
  };

  const timeRanges = [
    { id: '15m', label: '15 Min' },
    { id: '1h', label: '1 Hour' },
    { id: '6h', label: '6 Hours' },
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Observability & Analytics</h1>
          <p className="text-sm text-slate-400">Latency profiles, error rates, route volume and access logs</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
            {timeRanges.map((tr) => (
              <button
                key={tr.id}
                onClick={() => setTimeRange(tr.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  timeRange === tr.id
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleSeed}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Traffic</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Total Throughput</div>
            <div className="text-2xl font-bold font-mono text-white">{overview.totalRequests.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Over selected window</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Error Rate</div>
            <div className={`text-2xl font-bold font-mono ${overview.errorRatePercentage > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {overview.errorRatePercentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{overview.errorCount} total errors</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Latency (Avg / P95)</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {overview.avgLatencyMs} <span className="text-sm font-normal text-slate-400">/ {overview.p95LatencyMs}ms</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">P99: {overview.p99LatencyMs} ms</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-1">Active Routes Used</div>
            <div className="text-2xl font-bold font-mono text-indigo-400">{overview.activeRoutesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Unique intercepted paths</div>
          </div>
        </div>
      )}

      {/* Route Performance Breakdown Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white">Route Performance & Latency Profile</h2>
          <p className="text-xs text-slate-400">Volume and performance statistics broken down by API route</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Route ID</th>
                <th className="py-2.5 px-3">Total Requests</th>
                <th className="py-2.5 px-3">Success / Error</th>
                <th className="py-2.5 px-3">Error Rate</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Min / Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {routeMetrics && routeMetrics.length > 0 ? (
                routeMetrics.map((r) => (
                  <tr key={r.routeId} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{r.routeId}</td>
                    <td className="py-2.5 px-3 text-white">{r.totalRequests}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400">{r.successCount}</span> /{' '}
                      <span className="text-rose-400">{r.errorCount}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.errorRatePercentage > 0
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {r.errorRatePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-indigo-300 font-semibold">{r.avgLatencyMs} ms</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {r.minLatencyMs}ms / {r.maxLatencyMs}ms
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No route metrics available. Run tests or generate sample traffic!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Access Logs Explorer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Gateway Access Logs Explorer</h2>
            <p className="text-xs text-slate-400">Query detailed transaction logs with status and route filters</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <input
              type="text"
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              placeholder="Filter by routeId..."
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            />
            <input
              type="number"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              placeholder="Status (e.g. 429)"
              className="w-28 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Path</th>
                <th className="py-2.5 px-3">Route ID</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Client IP</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs && logs.length > 0 ? (
                logs.map((log) => {
                  const status = log.statusCode || 200;
                  const is2xx = status >= 200 && status < 300;
                  const is429 = status === 429;

                  return (
                    <tr key={log.id || log.requestId} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            is2xx
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : is429
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-300">{log.httpMethod}</td>
                      <td className="py-2 px-3 text-slate-300 truncate max-w-xs">{log.requestPath}</td>
                      <td className="py-2 px-3 text-cyan-400">{log.routeId}</td>
                      <td className="py-2 px-3 text-slate-400">{log.latencyMs} ms</td>
                      <td className="py-2 px-3 text-slate-500">{log.clientIp}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'now'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No logs found matching filters.
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

