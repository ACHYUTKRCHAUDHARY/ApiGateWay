// ═══════════════════════════════════════════════════════════════
// Sidebar — 220px fixed, dark navy gradient, collapsible at 900px
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Logo } from '@/components/icons/Logo';
import { Mascot } from '@/components/icons/Mascot';

const NAV_GROUPS = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
      { label: 'Transactions', path: '/transactions', icon: 'receipt' },
      { label: 'Analytics', path: '/analytics', icon: 'chart' },
    ],
  },
  {
    heading: 'Developers',
    items: [
      { label: 'API Keys', path: '/api-keys', icon: 'key' },
      { label: 'Webhooks', path: '/webhooks', icon: 'webhook' },
      { label: 'Routes', path: '/routes', icon: 'route' },
    ],
  },
  {
    heading: 'Billing',
    items: [
      { label: 'Organizations', path: '/organizations', icon: 'building' },
      { label: 'Audit Log', path: '/audit', icon: 'shield' },
    ],
  },
];

// Simple line icons as inline SVGs
const icons: Record<string, React.FC<{ size?: number }>> = {
  grid: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  receipt: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2Z" /><path d="M8 10h8M8 14h5" /></svg>
  ),
  chart: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M7 16l4-6 4 3 5-7" /></svg>
  ),
  key: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="15" r="5" /><path d="M11.7 11.3 21 2M17 6l4 0 0 4" /></svg>
  ),
  webhook: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a5 5 0 0 1 3 9l-3 7" /><path d="M12 2a5 5 0 0 0-3 9l3 7" /><circle cx="12" cy="19" r="3" /></svg>
  ),
  route: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M6 16V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v8" /></svg>
  ),
  building: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01" /></svg>
  ),
  shield: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2s8 4 8 10v4c0 4-8 6-8 6s-8-2-8-6v-4c0-6 8-10 8-10Z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on narrow viewports
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setCollapsed(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden transition-all duration-300"
      style={{
        width: sidebarWidth,
        background: 'linear-gradient(180deg, #0B1220 0%, #14203A 100%)',
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center h-[60px] px-4 shrink-0">
        <Logo collapsed={collapsed} />
      </div>

      {/* Live mode indicator */}
      <div className={`flex items-center gap-2 px-4 py-2 mx-3 mb-2 rounded-[8px] ${collapsed ? 'justify-center mx-1' : ''}`}
        style={{ background: 'rgba(52,211,153,0.08)' }}>
        <span className="pulse-dot w-2 h-2 rounded-full bg-[#34D399] inline-block shrink-0" />
        {!collapsed && (
          <>
            <span className="text-[11px] font-semibold text-[#34D399]" style={{ fontFamily: 'var(--font-body)' }}>Live mode</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#EF4444] text-white tracking-wider uppercase">NEW</span>
          </>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 mt-2">
        {NAV_GROUPS.map(group => (
          <div key={group.heading}>
            {!collapsed && (
              <p className="label-caps text-[#5A6785] px-2 mb-1.5 select-none">{group.heading}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(item => {
                const Icon = icons[item.icon] || icons.grid;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-colors duration-150 group ${
                        collapsed ? 'justify-center px-0' : ''
                      }`}
                      style={{
                        color: isActive ? '#FFFFFF' : '#8B9BC0',
                        fontFamily: 'var(--font-body)',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Active background highlight */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-[8px]"
                          style={{ background: '#1E3354' }}
                          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <motion.span
                        className="relative z-10 shrink-0"
                        whileHover={reduced ? {} : { rotate: [0, -12, 12, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon size={18} />
                      </motion.span>
                      {!collapsed && <span className="relative z-10">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: mascot + help */}
      <div className={`shrink-0 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <Mascot size={32} mood="happy" />
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Mascot size={36} mood="wave" />
            <div>
              <p className="text-[11px] font-semibold text-[#C5D0E6]" style={{ fontFamily: 'var(--font-body)' }}>Need help?</p>
              <p className="text-[10px] text-[#5A6785]" style={{ fontFamily: 'var(--font-body)' }}>Ask Bolt</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
