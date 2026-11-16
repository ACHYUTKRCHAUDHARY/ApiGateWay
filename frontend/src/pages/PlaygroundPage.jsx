import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Play,
  Zap,
  ShieldAlert,
  Repeat,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code,
  Copy,
  Layers,
  ChevronDown
} from 'lucide-react';

export const PlaygroundPage = ({ selectedRouteForTest }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/gateway/api/v1/mock/users');
  const [headers, setHeaders] = useState([
    { key: 'Accept', value: 'application/json' },
    { key: 'Idempotency-Key', value: 'demo-key-' + Math.floor(Math.random() * 1000) }
  ]);
  const [body, setBody] = useState('{\n  "name": "Jane Developer",\n  "role": "Lead Architect"\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [stressTesting, setStressTesting] = useState(false);
  const [stressResults, setStressResults] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.getRoutes();
        if (res && res.data) {
          setRoutes(res.data);
          if (selectedRouteForTest) {
            applyRoutePreset(selectedRouteForTest);
          } else if (res.data.length > 0) {
            applyRoutePreset(res.data[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoutes();
  }, [selectedRouteForTest]);

  const applyRoutePreset = (route) => {
    setSelectedRouteId(route.routeId);
    let samplePath = route.pathPattern.replace('/**', '').replace('/*', '');
    if (!samplePath.startsWith('/gateway')) {
      samplePath = `/gateway${samplePath.startsWith('/') ? '' : '/'}${samplePath}`;
    }
    setPath(samplePath);
    if (route.allowedMethods && route.allowedMethods.size > 0) {
      setMethod(Array.from(route.allowedMethods)[0]);
    }
  };

  const handleRouteChange = (routeId) => {
    const found = routes.find((r) => r.routeId === routeId);
    if (found) applyRoutePreset(found);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (idx, field, val) => {
    const updated = [...headers];
    updated[idx][field] = val;
    setHeaders(updated);
  };

  const removeHeader = (idx) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setStressResults([]);

    const headerObj = {};
    headers.forEach((h) => {
      if (h.key.trim()) {
        headerObj[h.key.trim()] = h.value;
      }
    });

    let parsedBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    const res = await api.testGatewayProxy(method, path, headerObj, parsedBody);
    setResponse(res);
    setLoading(false);
  };

  // Scenario 1: Rate Limit Stress Test (fires 15 rapid requests)
  const handleRateLimitTest = async () => {
    setStressTesting(true);
    setStressResults([]);
    const results = [];

    const headerObj = {};
    headers.forEach((h) => {
      if (h.key.trim()) headerObj[h.key.trim()] = h.value;
    });

    for (let i = 1; i <= 15; i++) {
      const res = await api.testGatewayProxy(method, path, headerObj);
      results.push({
        iteration: i,
        status: res.status,
        latencyMs: res.latencyMs,
        rateLimitRemaining: res.headers['x-ratelimit-remaining'] || 'N/A'
      });
      setStressResults([...results]);
    }
    setStressTesting(false);
  };

  // Scenario 2: Idempotency Duplicate Test
  const handleIdempotencyTest = async () => {
    setLoading(true);
    const testKey = 'idem-unique-' + Date.now();
    const testHeaders = {
      'Idempotency-Key': testKey,
      'Content-Type': 'application/json'
    };
    const testBody = { test: 'idempotency-payload', timestamp: Date.now() };

    // Request 1
    const res1 = await api.testGatewayProxy('POST', path, testHeaders, testBody);
    // Request 2 (Duplicate with same key)
    const res2 = await api.testGatewayProxy('POST', path, testHeaders, testBody);

    setResponse({
      ...res2,
      isIdempotencyDemo: true,
      originalRequest: res1,
      duplicateRequest: res2
    });
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Gateway Playground</h1>
          <p className="text-sm text-slate-400">
            Interactive client: execute real HTTP calls directly through the Smart Gateway (Port 8080)
          </p>
        </div>

        {/* Quick Test Scenarios */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRateLimitTest}
            disabled={stressTesting || loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            title="Fire 15 rapid requests to trigger 429 Too Many Requests"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate Limit Stress Test</span>
          </button>

          <button
            onClick={handleIdempotencyTest}
            disabled={stressTesting || loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            title="Send duplicate POST requests with identical Idempotency-Key"
          >
            <Repeat className="w-3.5 h-3.5 text-purple-400" />
            <span>Idempotency Test</span>
          </button>
        </div>
      </div>

      {/* Main Request Builder Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* Route Preset Dropdown */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400 font-medium">Route Preset:</span>
          <select
            value={selectedRouteId}
            onChange={(e) => handleRouteChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-medium focus:outline-none"
          >
            {routes.map((r) => (
              <option key={r.routeId} value={r.routeId}>
                {r.name} ({r.pathPattern})
              </option>
            ))}
          </select>
        </div>

        {/* Request URL Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Method Selector */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-cyan-400 focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          {/* URL Input */}
          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono">
            <span className="text-slate-500 mr-1 select-none">http://localhost:8080</span>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/gateway/api/v1/mock/users"
              className="flex-1 bg-transparent text-white focus:outline-none font-mono"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={loading || stressTesting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>

        {/* Headers and Body Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Headers Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Request Headers</span>
              <button
                type="button"
                onClick={addHeader}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                + Add Header
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    placeholder="Header-Key"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                  <button
                    onClick={() => removeHeader(i)}
                    className="text-slate-500 hover:text-rose-400 px-1 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Body Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Request Body (JSON)</span>
              <span className="text-[10px] text-slate-500">For POST, PUT, PATCH</span>
            </div>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Stress Test Live Output Table */}
      {stressResults.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold">
              <Zap className="w-4 h-4" />
              <span>Rate Limit Simulation Results (15 Requests)</span>
            </div>
            {stressTesting && (
              <span className="text-xs text-amber-300 animate-pulse">Running rapid burst test...</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-mono text-xs">
            {stressResults.map((r) => {
              const is2xx = r.status >= 200 && r.status < 300;
              const is429 = r.status === 429;
              return (
                <div
                  key={r.iteration}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    is429
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 font-bold shadow-sm'
                      : is2xx
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-800 text-rose-400'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Req #{r.iteration}</div>
                  <div className="text-sm font-bold mt-0.5">{r.status || 'ERR'}</div>
                  <div className="text-[10px] text-slate-400">{r.latencyMs}ms</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Panel */}
      {response && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400">Status:</span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : response.status === 429
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {response.status} {response.statusText}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{response.latencyMs} ms</span>
              </div>
              {response.headers['x-gateway-request-id'] && (
                <div className="text-slate-400 truncate max-w-xs">
                  ID: <span className="text-cyan-400">{response.headers['x-gateway-request-id']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Idempotency Demonstration Banner */}
          {response.headers['x-gateway-idempotent-replay'] && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 flex items-center space-x-2 text-xs text-purple-300">
              <Repeat className="w-4 h-4 text-purple-400" />
              <span>
                <strong>Idempotent Replay Verified:</strong> This response was served directly from the gateway's deduplication cache!
              </span>
            </div>
          )}

          {/* Headers & Body Accordion */}
          <div className="space-y-4">
            {/* Gateway Injected Headers */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Response Headers</span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="text-cyan-400 font-semibold w-56 truncate">{k}:</span>
                    <span className="text-slate-300 flex-1 truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Response Body</span>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(response.body, null, 2))}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80 overflow-y-auto">
                {typeof response.body === 'object'
                  ? JSON.stringify(response.body, null, 2)
                  : String(response.body)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

