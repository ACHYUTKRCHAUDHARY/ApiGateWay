// ═══════════════════════════════════════════════════════════════
// App Layout — sidebar + topbar + content area
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setCollapsed(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const marginLeft = collapsed ? 64 : 220;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <Sidebar />
      <div className="transition-all duration-300" style={{ marginLeft }}>
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
