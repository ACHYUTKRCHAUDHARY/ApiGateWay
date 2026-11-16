import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, RotateCcw, CheckCircle2, Layers, Clock, AlertCircle } from 'lucide-react';

export const VersionsPage = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollbackMessage, setRollbackMessage] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.getRoutes();
        if (res && res.data && res.data.length > 0) {
          setRoutes(res.data);
          setSelectedRouteId(res.data[0].routeId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoutes();
  }, []);

  const loadVersions = async (routeId) => {
    if (!routeId) return;
    setLoading(true);
    try {
      const res = await api.getRouteVersions(routeId);
      if (res && res.data) {
        setVersions(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRouteId) {
      loadVersions(selectedRouteId);
    }
  }, [selectedRouteId]);

  const handleRollback = async (targetVersion) => {
    if (!window.confirm(`Are you sure you want to rollback ${selectedRouteId} to version ${targetVersion}?`)) {
      return;
    }

    try {
      await api.rollbackRoute(selectedRouteId, targetVersion);
      await api.syncGateway();
      setRollbackMessage(`Successfully rolled back to version ${targetVersion}!`);
      setTimeout(() => setRollbackMessage(''), 4000);
      loadVersions(selectedRouteId);
    } catch (e) {
      alert('Rollback failed: ' + e.message);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Route Version History & Rollback</h1>
          <p className="text-sm text-slate-400">
            Audit immutable historical configuration snapshots and instantly rollback any API route
          </p>
        </div>

        {/* Route Selector */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400 font-medium">Select Route:</span>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono font-medium focus:outline-none"
          >
            {routes.map((r) => (
              <option key={r.routeId} value={r.routeId}>
                {r.name} ({r.routeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {rollbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{rollbackMessage}</span>
        </div>
      )}

      {/* Timeline of Versions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Snapshot Timeline ({versions.length} version{versions.length === 1 ? '' : 's'})
        </div>

        <div className="space-y-4">
          {versions && versions.length > 0 ? (
            versions.map((ver, idx) => {
              let parsedSnapshot = {};
              try {
                parsedSnapshot = JSON.parse(ver.configurationSnapshot);
              } catch {
                parsedSnapshot = ver.configurationSnapshot;
              }

              const isLatest = idx === 0;

              return (
                <div
                  key={ver.id}
                  className={`p-5 rounded-2xl border transition ${isLatest
                      ? 'bg-slate-950/80 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800/80'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold text-xs">
                        v{ver.versionNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {ver.changeType}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                          CURRENT ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(ver.createdAt).toLocaleString()}</span>
                      </div>

                      {!isLatest && (
                        <button
                          onClick={() => handleRollback(ver.versionNumber)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback to v{ver.versionNumber}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Configuration Snapshot details */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                    <pre className="text-cyan-300/90">{JSON.stringify(parsedSnapshot, null, 2)}</pre>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No configuration versions found for this route.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
