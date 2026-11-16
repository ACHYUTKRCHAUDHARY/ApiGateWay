import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, RefreshCw, Activity, Server, User, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [gatewayStatus, setGatewayStatus] = useState('checking');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const checkStatus = async () => {
    try {
      const res = await api.checkHealth('http://localhost:8080');
      setGatewayStatus(res.status === 'UP' ? 'UP' : 'DOWN');
    } catch {
      setGatewayStatus('DOWN');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.syncGateway();
      setSyncMessage(`Synced ${res.activeRoutesCount || 0} routes!`);
      setGatewayStatus('UP');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (e) {
      setSyncMessage('Sync failed: ' + e.message);
      setTimeout(() => setSyncMessage(''), 4000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-white tracking-wide">GATEKEEPER</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Smart API Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400">Enterprise Control & Data Plane</p>
        </div>
      </div>

      {/* Gateway Live Status & Actions */}
      <div className="flex items-center space-x-4">
        {syncMessage && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 animate-pulse">
            {syncMessage}
          </span>
        )}

        {/* Gateway Health Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Gateway (8080):</span>
          {gatewayStatus === 'UP' ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              ONLINE
            </span>
          ) : (
            <span className="flex items-center text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
              OFFLINE
            </span>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition cursor-pointer disabled:opacity-50"
          title="Force reload all routes into Smart Gateway cache"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Gateway'}</span>
        </button>

        {/* User Pill */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.username}</div>
              <div className="text-[10px] text-cyan-400 font-medium tracking-wide uppercase">
                {user.role} {user.organizationName ? `• ${user.organizationName}` : ''}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

