import React from 'react';
import {
  LayoutDashboard,
  Route,
  Zap,
  BarChart3,
  History,
  Building2,
  FileText,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'routes', label: 'API Routes', icon: Route, badge: null },
    { id: 'playground', label: 'API Playground', icon: Zap, badge: 'Live Tester' },
    { id: 'analytics', label: 'Analytics & Traffic', icon: BarChart3, badge: null },
    { id: 'versions', label: 'Version History', icon: History, badge: null },
    { id: 'organizations', label: 'Organizations', icon: Building2, badge: null },
    { id: 'audit', label: 'Audit Records', icon: FileText, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Control Plane
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Microservices Cluster Quick Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Architecture Nodes</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between items-center">
              <span>Data Plane (Gateway)</span>
              <span className="font-mono text-cyan-400">:8080</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Control Plane (Mgmt)</span>
              <span className="font-mono text-cyan-400">:8081</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Observability (Analytics)</span>
              <span className="font-mono text-cyan-400">:8082</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-lg bg-slate-950/40 text-[11px] text-slate-500 border border-slate-800/60">
        <div className="flex items-center justify-between">
          <span>Gatekeeper Engine</span>
          <span className="text-cyan-400 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

