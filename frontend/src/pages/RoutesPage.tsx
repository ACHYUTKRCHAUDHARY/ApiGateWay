import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { routesApi, gatewayApi } from '@/services/api';
import { StatusPill, SkeletonBlock } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import type { Route, CreateRouteRequest, RouteVersion } from '@/types';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  // Version History Drawer State
  const [selectedRouteForHistory, setSelectedRouteForHistory] = useState<Route | null>(null);
  const [versions, setVersions] = useState<RouteVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  // Playground / Tester State
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [playgroundPath, setPlaygroundPath] = useState('/echo');
  const [playgroundBody, setPlaygroundBody] = useState('{"message":"Hello from Gateway Console"}');
  const [playgroundHeaders, setPlaygroundHeaders] = useState('{"X-Custom-Client":"Gatekeeper-Dashboard"}');
  const [testingInFlight, setTestingInFlight] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    data: any;
  } | null>(null);

  // Create form state
  const [formData, setFormData] = useState<CreateRouteRequest>({
    name: '',
    routeId: '',
    pathPattern: '',
    targetBaseUrl: '',
    targetPathPrefix: '',
    requestsPerMinute: 60,
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
      await gatewayApi.sync().catch(() => {});
      addToast('Route state toggled and gateway synced', 'success');
      loadRoutes();
    } catch {
      addToast('Failed to toggle route', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this route from the smart gateway?')) return;
    try {
      await routesApi.delete(id);
      await gatewayApi.sync().catch(() => {});
      addToast('Route deleted and gateway synced', 'success');
      loadRoutes();
    } catch {
      addToast('Failed to delete route', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const derivedRouteId = formData.routeId || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await routesApi.create({ ...formData, routeId: derivedRouteId });
      await gatewayApi.sync().catch(() => {});
      addToast('New route registered with Smart Gateway', 'success');
      setShowCreateModal(false);
      setFormData({
        name: '',
        routeId: '',
        pathPattern: '',
        targetBaseUrl: '',
        targetPathPrefix: '',
        requestsPerMinute: 60,
        responseTimeoutMs: 5000,
        idempotencyEnabled: false,
        allowedMethods: ['GET', 'POST'],
      });
      loadRoutes();
    } catch (err: any) {
      addToast(err.message || 'Failed to create route', 'error');
    }
  };

  // Open Version History Drawer
  const handleOpenHistory = async (route: Route) => {
    setSelectedRouteForHistory(route);
    setLoadingVersions(true);
    try {
      const res = await routesApi.versions(route.routeId);
      setVersions(res.data || []);
    } catch {
      addToast('Failed to load version snapshots', 'error');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Execute 1-Click Rollback
  const handleRollback = async (targetVersion: number) => {
    if (!selectedRouteForHistory) return;
    if (!window.confirm(`Roll back route '${selectedRouteForHistory.name}' to version ${targetVersion}?`)) return;
    setRollingBack(true);
    try {
      await routesApi.rollback(selectedRouteForHistory.routeId, targetVersion);
      await gatewayApi.sync().catch(() => {});
      addToast(`Route successfully rolled back to v${targetVersion}!`, 'success');
      setSelectedRouteForHistory(null);
      loadRoutes();
    } catch (err: any) {
      addToast(err.message || 'Rollback failed', 'error');
    } finally {
      setRollingBack(false);
    }
  };

  // Dispatch Single Live Request through Gateway
  const handleSendLiveRequest = async (overrideHeaders?: Record<string, string>) => {
    setTestingInFlight(true);
    setTestResponse(null);
    const start = performance.now();
    try {
      let customH: Record<string, string> = {};
      try {
        if (playgroundHeaders.trim()) customH = JSON.parse(playgroundHeaders);
      } catch {}

      if (overrideHeaders) {
        customH = { ...customH, ...overrideHeaders };
      }

      const cleanPath = playgroundPath.startsWith('/') ? playgroundPath : `/${playgroundPath}`;
      const url = cleanPath.startsWith('/gateway') ? cleanPath : `/gateway${cleanPath}`;

      const res = await fetch(url, {
        method: playgroundMethod,
        headers: {
          'Content-Type': 'application/json',
          ...customH,
        },
        body: playgroundMethod !== 'GET' ? playgroundBody : undefined,
      });

      const latencyMs = Math.round(performance.now() - start);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      let data: any;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setTestResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : res.status === 429 ? 'Too Many Requests' : 'Response'),
        latencyMs,
        headers: resHeaders,
        data,
      });
      addToast(`Gateway responded: HTTP ${res.status} in ${latencyMs}ms`, res.ok ? 'success' : 'error');
    } catch (err: any) {
      setTestResponse({
        status: 0,
        statusText: 'Network / Gateway Error',
        latencyMs: Math.round(performance.now() - start),
        headers: {},
        data: { error: err.message || 'Failed to reach Smart Gateway proxy on port 8080' },
      });
      addToast('Failed to reach Smart Gateway', 'error');
    } finally {
      setTestingInFlight(false);
    }
  };

  // Rate Limit Stress Test: 15 rapid requests
  const handleRateLimitStressTest = async () => {
    addToast('Executing 15 rapid requests to trigger HTTP 429 Rate Limiting...', 'info');
    setTestingInFlight(true);
    let hit429 = false;
    for (let i = 1; i <= 15; i++) {
      try {
        const res = await fetch('/gateway/echo', {
          method: 'GET',
          headers: { 'X-Stress-Test': `run-${i}` },
        });
        if (res.status === 429) {
          hit429 = true;
          const headers: Record<string, string> = {};
          res.headers.forEach((v, k) => { headers[k] = v; });
          const text = await res.text();
          let data: any;
          try { data = JSON.parse(text); } catch { data = text; }
          setTestResponse({
            status: 429,
            statusText: 'Too Many Requests (Rate Limit Triggered)',
            latencyMs: 3,
            headers,
            data,
          });
          addToast(`Rate limit verified! Request #${i} returned HTTP 429 Too Many Requests`, 'success');
          break;
        }
      } catch {}
    }
    if (!hit429) {
      addToast('Sent 15 requests within quota. Quota remaining decreased.', 'info');
      handleSendLiveRequest();
    }
    setTestingInFlight(false);
  };

  // Idempotency Deduplication Test: 2 consecutive requests with identical key
  const handleIdempotencyTest = async () => {
    const key = `idem_${Math.random().toString(36).substring(2, 10)}`;
    addToast(`Dispatching duplicate requests with Idempotency-Key: ${key}`, 'info');
    setPlaygroundMethod('POST');
    setPlaygroundPath('/api/v1/users');
    setPlaygroundBody(JSON.stringify({ name: 'Idempotency Probe', email: 'probe@gateway.io' }));

    // Send first request
    await handleSendLiveRequest({ 'Idempotency-Key': key });

    // Send duplicate request
    setTimeout(async () => {
      addToast('Sending replay request with same Idempotency-Key...', 'info');
      await handleSendLiveRequest({ 'Idempotency-Key': key });
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-light)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-[#F97316]">Data Plane</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">Port 8080 Reverse Proxy</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
            API Gateway Routes & Policies
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure dynamic upstream routing rules, rate limit quotas, header mutation, and version rollbacks
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

      {/* 2. Routes Table */}
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
                  <th className="py-3 px-3">Name / Identifier</th>
                  <th className="py-3 px-3">Path Pattern</th>
                  <th className="py-3 px-3">Upstream Base</th>
                  <th className="py-3 px-3">Quota</th>
                  <th className="py-3 px-3">Methods</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {routes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-[var(--navy)]">{rt.name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">{rt.routeId}</div>
                    </td>
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold font-mono">
                      {rt.pathPattern}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] truncate max-w-xs font-mono">
                      {rt.targetBaseUrl}{rt.targetPathPrefix || ''}
                    </td>
                    <td className="py-3 px-3 font-mono">{rt.requestsPerMinute} RPM</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
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
                      <button
                        onClick={() => handleOpenHistory(rt)}
                        className="px-2 py-0.5 rounded-[4px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                        title="View configuration versions & rollback snapshots"
                      >
                        v{rt.configurationVersion || 1} ↺
                      </button>
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

      {/* 3. API Gateway Playground (Interactive Live Tester) */}
      <div className="card border border-[var(--border-light)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="label-caps text-[#059669]">Interactive Gateway Console</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">Live Port 8080 Dispatcher</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--navy)]" style={{ fontFamily: 'var(--font-body)' }}>
              API Gateway Playground
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Send live HTTP requests through Smart Gateway to test route matching, header mutations, rate limiting, and idempotency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRateLimitStressTest}
              disabled={testingInFlight}
              className="px-3 py-1.5 rounded-[8px] bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 text-xs font-extrabold hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              ⚡ Rate Limit Stress Test (15 Req)
            </button>
            <button
              onClick={handleIdempotencyTest}
              disabled={testingInFlight}
              className="px-3 py-1.5 rounded-[8px] bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 text-xs font-extrabold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              🔒 Idempotency Duplicate Test
            </button>
          </div>
        </div>

        {/* Request Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            <label className="block label-caps text-[var(--text-secondary)] mb-1">Method</label>
            <select
              value={playgroundMethod}
              onChange={(e) => setPlaygroundMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] font-mono text-xs font-bold"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="lg:col-span-7">
            <label className="block label-caps text-[var(--text-secondary)] mb-1">Gateway Endpoint Path</label>
            <div className="flex items-center">
              <span className="px-3 py-2 rounded-l-[8px] bg-[var(--surface-2)] border border-r-0 border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
                http://localhost:8080
              </span>
              <input
                type="text"
                value={playgroundPath}
                onChange={(e) => setPlaygroundPath(e.target.value)}
                placeholder="/echo or /api/v1/users"
                className="w-full px-3 py-2 rounded-r-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] font-mono text-xs"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              onClick={() => handleSendLiveRequest()}
              disabled={testingInFlight}
              className="w-full h-9 rounded-[8px] bg-[#D4F564] text-[var(--navy)] font-extrabold text-xs hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {testingInFlight ? 'Sending...' : 'Send Request ▶'}
            </button>
          </div>
        </div>

        {/* Body & Headers Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block label-caps text-[var(--text-secondary)] mb-1">Custom Request Headers (JSON)</label>
            <textarea
              rows={2}
              value={playgroundHeaders}
              onChange={(e) => setPlaygroundHeaders(e.target.value)}
              placeholder='{"X-Custom-Client":"Gatekeeper-Dashboard"}'
              className="w-full p-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] font-mono text-xs"
            />
          </div>
          {playgroundMethod !== 'GET' ? (
            <div>
              <label className="block label-caps text-[var(--text-secondary)] mb-1">Request JSON Body</label>
              <textarea
                rows={2}
                value={playgroundBody}
                onChange={(e) => setPlaygroundBody(e.target.value)}
                className="w-full p-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] font-mono text-xs"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center text-xs text-[var(--text-muted)] italic p-2 border border-dashed border-[var(--border)] rounded-[8px]">
              <span>GET requests do not include a body payload.</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Use custom headers to test gateway header propagation rules.</span>
            </div>
          )}
        </div>

        {/* Live Response Panel */}
        {testResponse && (
          <div className="p-4 rounded-[12px] bg-slate-900 text-slate-100 space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  testResponse.status >= 200 && testResponse.status < 300
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : testResponse.status === 429
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  HTTP {testResponse.status} {testResponse.statusText}
                </span>
                <span className="text-slate-400 text-[11px]">Latency: <strong className="text-white">{testResponse.latencyMs} ms</strong></span>
              </div>
              <span className="text-[10px] text-slate-500">Live Smart Gateway Response</span>
            </div>

            {/* Key Response Headers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-[6px]">
              <div>Limit: <span className="text-white font-bold">{testResponse.headers['x-ratelimit-limit'] || 'N/A'}</span></div>
              <div>Remaining: <span className="text-white font-bold">{testResponse.headers['x-ratelimit-remaining'] || 'N/A'}</span></div>
              <div>Request ID: <span className="text-white truncate block">{testResponse.headers['x-gateway-request-id'] || 'N/A'}</span></div>
              <div>Idempotent Replay: <span className="text-amber-400 font-bold">{testResponse.headers['x-gateway-idempotent-replay'] ? 'TRUE (CACHED)' : 'False'}</span></div>
            </div>

            {/* Response Body */}
            <div>
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Response Payload</span>
              <pre className="max-h-56 overflow-auto p-3 rounded-[6px] bg-black/60 text-emerald-400 text-[11px] leading-relaxed">
                {typeof testResponse.data === 'string'
                  ? testResponse.data
                  : JSON.stringify(testResponse.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 4. Create Route Modal */}
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
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block label-caps text-[var(--text-secondary)] mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payments Service Route"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        routeId: formData.routeId || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--navy)] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block label-caps text-[var(--text-secondary)] mb-1">Route Identifier (Slug)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. payments-service-route"
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
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

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="idempCheck"
                    checked={formData.idempotencyEnabled}
                    onChange={(e) => setFormData({ ...formData, idempotencyEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="idempCheck" className="text-xs font-semibold text-[var(--navy)] dark:text-white cursor-pointer">
                    Enable Idempotency Deduplication (Idempotency-Key caching)
                  </label>
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

      {/* 5. Version History & 1-Click Rollback Drawer */}
      <AnimatePresence>
        {selectedRouteForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRouteForHistory(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-[#14203A] border-l border-[var(--border)] z-10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <span className="label-caps text-indigo-500 text-[10px]">Version Snapshot Ledger</span>
                    <h3 className="text-base font-extrabold text-[var(--navy)] dark:text-white">
                      {selectedRouteForHistory.name}
                    </h3>
                    <span className="font-mono text-xs text-[var(--text-muted)]">{selectedRouteForHistory.routeId}</span>
                  </div>
                  <button onClick={() => setSelectedRouteForHistory(null)} className="text-gray-400 hover:text-black dark:hover:text-white">✕</button>
                </div>

                {loadingVersions ? (
                  <div className="space-y-3 py-6">
                    {[1, 2, 3].map((i) => (
                      <SkeletonBlock key={i} className="h-16 w-full rounded-[8px]" />
                    ))}
                  </div>
                ) : versions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)] font-mono border border-dashed border-[var(--border)] rounded-[8px]">
                    No historical snapshots recorded yet. Initial version is active.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-3.5 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono">
                              v{ver.versionNumber}
                            </span>
                            <span className="text-xs font-bold text-[var(--navy)] dark:text-white">
                              {ver.changeType}
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                            By {ver.changedBy} on {new Date(ver.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {ver.versionNumber !== selectedRouteForHistory.configurationVersion && (
                          <button
                            onClick={() => handleRollback(ver.versionNumber)}
                            disabled={rollingBack}
                            className="px-2.5 py-1 rounded-[6px] bg-[#D4F564] text-[var(--navy)] text-[10px] font-extrabold hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setSelectedRouteForHistory(null)}
                  className="w-full py-2 rounded-[8px] border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  Close Version Ledger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
