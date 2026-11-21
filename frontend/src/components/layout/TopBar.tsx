// ═══════════════════════════════════════════════════════════════
// TopBar — dark navy with text tabs and lime button
// ═══════════════════════════════════════════════════════════════
import React from 'react';
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
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const reduced = useReducedMotion();

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
        {TABS.map(tab => {
          const active = location.pathname === tab.path ||
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
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8B9BC0] hover:text-white transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          )}
        </button>

        {/* User pill */}
        {user && (
          <span className="text-[12px] font-medium text-[#8B9BC0] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {user.username}
          </span>
        )}

        {/* CTA: Go Live */}
        <motion.button
          whileHover={reduced ? {} : { scale: 1.02 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] text-[12px] font-bold border-2 transition-colors"
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </motion.button>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-[12px] text-[#5A6785] hover:text-[#C5D0E6] transition-colors font-medium"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
};
