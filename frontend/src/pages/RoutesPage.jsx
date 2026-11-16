import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Plus,
  Search,
  Route,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  Play,
  History,
  Shield,
  Layers,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export const RoutesPage = ({ setActiveTab, setSelectedRouteForTest }) => {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    routeId: '',
    name: '',
    pathPattern: '',
    targetBaseUrl: 'http://localhost:8081',
    targetPathPrefix: '',
    requestsPerMinute: 60,
    responseTimeoutMs: 5000,
    idempotencyEnabled: false,
    active: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    headerRules: []
  });

  const availableMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.getRoutes(search);
      if (res && res.data) {
        setRoutes(res.data);
      }
    } catch (e) {
      console.error('Failed to load routes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, [search]);

  const handleToggle = async (id) => {
    try {
      await api.toggleRoute(id);
      await api.syncGateway(); // sync gateway data plane immediately
      loadRoutes();
      showToast('Route status toggled & synced with Gateway!');
    } catch (e) {
      alert('Error toggling route: ' + e.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete route "${name}"?`)) return;
    try {
      await api.deleteRoute(id);
      await api.syncGateway();
      loadRoutes();
      showToast(`Deleted route "${name}"`);
    } catch (e) {
      alert('Error deleting route: ' + e.message);
    }
  };

  const openCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      routeId: '',
      name: '',
      pathPattern: '',
      targetBaseUrl: 'http://localhost:8081',
      targetPathPrefix: '',
      requestsPerMinute: 60,
      responseTimeoutMs: 5000,
      idempotencyEnabled: false,
      active: true,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      headerRules: []
    });
    setModalOpen(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setFormData({
      routeId: route.routeId,
      name: route.name,
      pathPattern: route.pathPattern,
      targetBaseUrl: route.targetBaseUrl,
      targetPathPrefix: route.targetPathPrefix || '',
      requestsPerMinute: route.requestsPerMinute || 60,
      responseTimeoutMs: route.responseTimeoutMs || 5000,
      idempotencyEnabled: !!route.idempotencyEnabled,
      active: !!route.active,
      allowedMethods: route.allowedMethods ? Array.from(route.allowedMethods) : ['GET'],
      headerRules: route.headerRules ? [...route.headerRules] : []
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await api.updateRoute(editingRoute.id, formData);
        showToast(`Route updated to version ${editingRoute.configurationVersion + 1}`);
      } else {
        await api.createRoute(formData);
        showToast('New route registered successfully');
      }
      await api.syncGateway();
      setModalOpen(false);
      loadRoutes();
    } catch (e) {
      alert('Failed to save route: ' + e.message);
    }
  };

  const handleTestRoute = (route) => {
    if (setSelectedRouteForTest) {
      setSelectedRouteForTest(route);
    }
    setActiveTab('playground');
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const toggleMethod = (m) => {
    setFormData((prev) => {
      const exists = prev.allowedMethods.includes(m);
      return {
        ...prev,
        allowedMethods: exists
          ? prev.allowedMethods.filter((item) => item !== m)
          : [...prev.allowedMethods, m]
      };
    });
  };

  const addHeaderRule = () => {
    setFormData((prev) => ({
      ...prev,
      headerRules: [
        ...prev.headerRules,
        { direction: 'REQUEST', action: 'ADD', headerName: '', headerValue: '' }
      ]
    }));
  };

  const updateHeaderRule = (index, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.headerRules];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, headerRules: updated };
    });
  };

  const removeHeaderRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      headerRules: prev.headerRules.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Routes Management</h1>
          <p className="text-sm text-slate-400">Configure URL patterns, upstream forwarding, rate limits & header rules</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Route</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes by ID, name or path pattern..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {routes.length} route{routes.length === 1 ? '' : 's'} configured
        </span>
      </div>

      {/* Routes Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Route ID & Name</th>
                <th className="py-3 px-3">Path Pattern</th>
                <th className="py-3 px-3">Target Upstream</th>
                <th className="py-3 px-3">Rate Limit</th>
                <th className="py-3 px-3">Timeout</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {routes && routes.length > 0 ? (
                routes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggle(route.id)}
                        className="cursor-pointer transition hover:opacity-80"
                        title={route.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {route.active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            INACTIVE
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{route.name}</div>
                      <div className="text-[11px] text-cyan-400">{route.routeId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-semibold">
                        {route.pathPattern}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="truncate max-w-xs">{route.targetBaseUrl}</div>
                      {route.targetPathPrefix && (
                        <div className="text-[10px] text-slate-500 font-sans">
                          prefix: {route.targetPathPrefix}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-semibold">{route.requestsPerMinute}</span>
                      <span className="text-[10px] text-slate-500 ml-1">req/min</span>
                    </td>

                    <td className="py-3 px-3 text-slate-400">{route.responseTimeoutMs} ms</td>

                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        v{route.configurationVersion}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTestRoute(route)}
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition cursor-pointer"
                          title="Test route in API Playground"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(route)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Edit Route"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id, route.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition cursor-pointer"
                          title="Delete Route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No routes found matching query. Click "Create New Route" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingRoute ? `Edit Route (${editingRoute.routeId})` : 'Create New API Route'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Route ID (Slug)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoute}
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    placeholder="e.g. payment-service-route"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Payment Gateway Service"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Path Pattern</label>
                <input
                  type="text"
                  required
                  value={formData.pathPattern}
                  onChange={(e) => setFormData({ ...formData, pathPattern: e.target.value })}
                  placeholder="e.g. /api/v1/payments/** or /orders/*"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500">
                  Incoming requests matching this Ant pattern will be intercepted and proxied.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Base URL</label>
                  <input
                    type="text"
                    required
                    value={formData.targetBaseUrl}
                    onChange={(e) => setFormData({ ...formData, targetBaseUrl: e.target.value })}
                    placeholder="http://localhost:8081"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Path Prefix (Optional)</label>
                  <input
                    type="text"
                    value={formData.targetPathPrefix}
                    onChange={(e) => setFormData({ ...formData, targetPathPrefix: e.target.value })}
                    placeholder="e.g. /api/v1/mock"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Rate Limit & Timeout */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Limit (Requests / Min)</label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={formData.requestsPerMinute}
                    onChange={(e) => setFormData({ ...formData, requestsPerMinute: parseInt(e.target.value) || 60 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timeout (Milliseconds)</label>
                  <input
                    type="number"
                    min="100"
                    max="60000"
                    value={formData.responseTimeoutMs}
                    onChange={(e) => setFormData({ ...formData, responseTimeoutMs: parseInt(e.target.value) || 5000 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Allowed Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Allowed HTTP Methods</label>
                <div className="flex flex-wrap gap-2">
                  {availableMethods.map((m) => {
                    const selected = formData.allowedMethods.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => toggleMethod(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${selected
                            ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.idempotencyEnabled}
                    onChange={(e) => setFormData({ ...formData, idempotencyEnabled: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span>Enable Idempotency Deduplication</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span>Route Active Immediately</span>
                </label>
              </div>

              {/* Header Transformation Rules */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-200">Header Transformation Rules</label>
                  <button
                    type="button"
                    onClick={addHeaderRule}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.headerRules && formData.headerRules.length > 0 ? (
                    formData.headerRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                        <select
                          value={rule.direction}
                          onChange={(e) => updateHeaderRule(idx, 'direction', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
                        >
                          <option value="REQUEST">Request</option>
                          <option value="RESPONSE">Response</option>
                        </select>
                        <select
                          value={rule.action}
                          onChange={(e) => updateHeaderRule(idx, 'action', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
                        >
                          <option value="ADD">ADD</option>
                          <option value="SET">SET</option>
                          <option value="REMOVE">REMOVE</option>
                        </select>
                        <input
                          type="text"
                          value={rule.headerName}
                          onChange={(e) => updateHeaderRule(idx, 'headerName', e.target.value)}
                          placeholder="Header-Name"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                        />
                        {rule.action !== 'REMOVE' && (
                          <input
                            type="text"
                            value={rule.headerValue}
                            onChange={(e) => updateHeaderRule(idx, 'headerValue', e.target.value)}
                            placeholder="Value"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeHeaderRule(idx)}
                          className="p-1 hover:text-rose-400 text-slate-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">No custom header rules defined.</div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {editingRoute ? 'Save Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
