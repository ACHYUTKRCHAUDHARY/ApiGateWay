import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  RefreshCw,
  Server,
  Zap,
  AlertTriangle,
  Play
} from 'lucide-react';

export const DashboardPage = ({ setActiveTab }) => {
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [statusCodes, setStatusCodes] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState({
    gateway: 'UP',
    mgmt: 'UP',
    analytics: 'UP'
  });

  const loadData = async () => {
    try {
      const [ov, ts, sc, logs, hGateway, hMgmt, hAnalytics] = await Promise.allSettled([
        api.getAnalyticsOverview('1h'),
        api.getAnalyticsTimeseries('1h'),
        api.getAnalyticsStatusCodes('1h'),
        api.getAnalyticsLogs('', '', 10),
        api.checkHealth('http://localhost:8080'),
        api.checkHealth('http://localhost:8081'),
        api.checkHealth('http://localhost:8082')
      ]);

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (ts.status === 'fulfilled') setTimeseries(ts.value);
      if (sc.status === 'fulfilled') setStatusCodes(sc.value);
      if (logs.status === 'fulfilled') setRecentLogs(logs.value);

      setHealthStatus({
        gateway: hGateway.status === 'fulfilled' && hGateway.value.status === 'UP' ? 'UP' : 'DOWN',
        mgmt: hMgmt.status === 'fulfilled' && hMgmt.value.status === 'UP' ? 'UP' : 'DOWN',
        analytics: hAnalytics.status === 'fulfilled' && hAnalytics.value.status === 'UP' ? 'UP' : 'DOWN'
      });
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedTraffic = async () => {
    try {
      await api.seedSampleAnalytics();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Safe fallback values
  const totalReqs = overview ? overview.totalRequests : 0;
  const successRate = overview ? (100 - overview.errorRatePercentage).toFixed(1) : 100.0;
  const avgLatency = overview ? overview.avgLatencyMs.toFixed(1) : '0.0';
  const p95Latency = overview ? overview.p95LatencyMs : 0;
  const activeRoutes = overview ? overview.activeRoutesCount : 3;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-400">Live metrics, cluster health and gateway traffic</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeedTraffic}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Seed simulated test logs into Analytics engine"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Sample Traffic</span>
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Open API Playground</span>
          </button>
        </div>
      </div>

      {/* Cluster Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${healthStatus.gateway === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Smart Gateway</div>
              <div className="text-[11px] text-slate-400 font-mono">Port :8080 (Data Plane)</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${healthStatus.gateway === 'UP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
            {healthStatus.gateway}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${healthStatus.mgmt === 'UP' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">API Management</div>
              <div className="text-[11px] text-slate-400 font-mono">Port :8081 (Control Plane)</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${healthStatus.mgmt === 'UP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
            {healthStatus.mgmt}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${healthStatus.analytics === 'UP' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Analytics Service</div>
              <div className="text-[11px] text-slate-400 font-mono">Port :8082 (Observability)</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${healthStatus.analytics === 'UP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
            {healthStatus.analytics}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Requests</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalReqs.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>Active monitoring</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{successRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">2xx / 3xx responses</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Latency</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{avgLatency} ms</div>
          <div className="text-[11px] text-slate-400 mt-1">P95: {p95Latency} ms</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Configured Routes</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeRoutes}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Synced to Data Plane</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Throughput */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white">Traffic Throughput</h2>
              <p className="text-xs text-slate-400">Request volume over time</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              Last 60 Minutes
            </span>
          </div>

          {/* SVG Bar / Line Chart */}
          <div className="h-52 flex items-end space-x-2 pt-6">
            {timeseries && timeseries.length > 0 ? (
              timeseries.map((pt, idx) => {
                const max = Math.max(...timeseries.map((t) => t.totalRequests), 10);
                const heightPct = Math.max(5, (pt.totalRequests / max) * 100);
                const isError = pt.errorCount > 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-950 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-20">
                      <div>{pt.timeLabel}</div>
                      <div>Reqs: {pt.totalRequests} | Err: {pt.errorCount}</div>
                      <div>Avg: {pt.avgLatencyMs}ms</div>
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isError
                          ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-sm shadow-rose-500/20'
                          : 'bg-gradient-to-t from-cyan-600 to-indigo-500 group-hover:from-cyan-400 group-hover:to-indigo-400 shadow-sm shadow-cyan-500/20'
                      }`}
                    />
                    <span className="text-[9px] text-slate-500 mt-2 truncate w-full text-center">
                      {idx % 4 === 0 ? pt.timeLabel : ''}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Activity className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <span>No traffic recorded yet. Send requests or click "Generate Sample Traffic"!</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Codes Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-white">Status Breakdown</h2>
            <p className="text-xs text-slate-400">HTTP status response classes</p>
          </div>

          <div className="space-y-4">
            {statusCodes && statusCodes.length > 0 ? (
              statusCodes.map((sc) => {
                const is2xx = sc.statusCode >= 200 && sc.statusCode < 300;
                const is4xx = sc.statusCode >= 400 && sc.statusCode < 500;
                const is5xx = sc.statusCode >= 500;

                const colorClass = is2xx
                  ? 'bg-emerald-500'
                  : is4xx
                  ? 'bg-amber-500'
                  : is5xx
                  ? 'bg-rose-500'
                  : 'bg-cyan-500';

                return (
                  <div key={sc.statusCode} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{sc.statusCode}</span>
                        <span className="text-slate-400">{sc.statusCategory}</span>
                      </div>
                      <span className="font-mono text-slate-300">{sc.count} ({sc.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${sc.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No status code data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Traffic Feed Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Live Gateway Traffic Stream</h2>
            <p className="text-xs text-slate-400">Most recent requests proxied through Smart Gateway</p>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
          >
            View Full Logs &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Path</th>
                <th className="py-2.5 px-3">Route ID</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Client IP</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log) => {
                  const status = log.statusCode || 200;
                  const isSuccess = status >= 200 && status < 400;
                  const isRateLimited = status === 429;
                  const isError = status >= 500;

                  return (
                    <tr key={log.id || log.requestId} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isRateLimited
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-300">{log.httpMethod}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-xs">{log.requestPath}</td>
                      <td className="py-2.5 px-3 text-cyan-400">{log.routeId}</td>
                      <td className="py-2.5 px-3 text-slate-400">{log.latencyMs} ms</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.clientIp}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'now'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No requests recorded yet. Open the API Playground to send real gateway requests!
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

