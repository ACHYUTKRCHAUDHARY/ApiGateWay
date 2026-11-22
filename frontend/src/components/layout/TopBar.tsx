// ═══════════════════════════════════════════════════════════════
// TopBar — dark navy with text tabs, status badge, and lime button
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const TABS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Developers', path: '/api-keys' },
  { label: 'Analytics', path: '/analytics' },
];

export const TopBar: React.FC = () => {
  const { user, logout, isDemo, backendUrl, updateBackendUrl } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const reduced = useReducedMotion();

  const [showConfig, setShowConfig] = useState(false);
  const [targetUrl, setTargetUrl] = useState(backendUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendUrl(targetUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowConfig(false);
    }, 1200);
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-[52px] px-6 border-b"
      style={{
        background: '#0B1220',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Tabs */}
      <nav className="flex items-center gap-1 h-full" aria-label="Section tabs">
        {TABS.map((tab) => {
          const active =
            location.pathname === tab.path ||
            (tab.path === '/api-keys' && ['/api-keys', '/webhooks', '/routes'].includes(location.pathname));
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="relative flex items-center h-full px-3 text-[13px] font-semibold transition-colors"
              style={{
                color: active ? '#FFFFFF' : '#8B9BC0',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tab.label}
              {active && (
                <motion.div
                  layoutId="topbar-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ background: '#FFFFFF' }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Backend Environment Status Badge */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
            backendUrl && !isDemo
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
          }`}
          title="Click to configure Gateway backend URL"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${backendUrl && !isDemo ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{backendUrl && !isDemo ? 'Live Gateway' : 'Sandbox Demo'}</span>
          <span className="text-[9px] opacity-60">⚙</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8B9BC0] hover:text-white transition-colors cursor-pointer"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>

        {/* User pill */}
        {user && (
          <span
            className="text-[12px] font-medium text-[#8B9BC0] px-2.5 py-1 rounded-full border border-white/5"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {user.username}
          </span>
        )}

        {/* CTA: Go Live */}
        <motion.button
          whileHover={reduced ? {} : { scale: 1.02 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] text-[12px] font-bold border-2 transition-colors cursor-pointer"
          style={{
            borderColor: '#D4F564',
            color: '#D4F564',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.04em',
          }}
          onClick={() => window.open('https://docs.paygate.dev', '_blank')}
        >
          GO LIVE
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-[12px] text-[#5A6785] hover:text-[#C5D0E6] transition-colors font-medium cursor-pointer"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Sign out
        </button>
      </div>

      {/* Backend Settings Dialog */}
      {showConfig && (
        <div className="absolute top-[56px] right-6 z-50 w-80 p-4 rounded-[12px] bg-[#14203A] border border-[rgba(255,255,255,0.12)] shadow-2xl text-white text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <span className="font-bold text-sm">Gateway Environment</span>
            <button onClick={() => setShowConfig(false)} className="text-[#8B9BC0] hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#8B9BC0] mb-1 font-mono">Backend Gateway URL</label>
              <input
                type="url"
                placeholder="https://smart-gateway-xxxx.onrender.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[6px] bg-[#0B1220] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-[#D4F564]"
              />
              <p className="text-[10px] text-[#8B9BC0]/70 mt-1">
                Enter your Render Gateway URL or leave blank for local/sandbox.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 px-3 rounded-[6px] bg-[#D4F564] text-[#0B1220] font-bold text-xs hover:bg-[#C8EC50] cursor-pointer"
              >
                {savedSuccess ? 'Saved!' : 'Save & Connect'}
              </button>
              {backendUrl && (
                <button
                  type="button"
                  onClick={() => {
                    updateBackendUrl(null);
                    setTargetUrl('');
                    setShowConfig(false);
                  }}
                  className="py-1.5 px-2.5 rounded-[6px] bg-white/10 hover:bg-white/15 text-xs text-[#8B9BC0] cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
