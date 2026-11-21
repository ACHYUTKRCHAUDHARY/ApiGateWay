// ═══════════════════════════════════════════════════════════════
// PayGate Logo — payment bolt mark + wordmark
// ═══════════════════════════════════════════════════════════════
import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="PayGate logo">
      {/* Shield shape */}
      <path d="M16 2 L28 8 L28 18 C28 25, 20 30, 16 31 C12 30, 4 25, 4 18 L4 8 Z" fill="#D4F564" stroke="#0B1220" strokeWidth="1.5" />
      {/* Bolt */}
      <path d="M18 7 L11 18 L15 18 L13 25 L22 15 L17.5 15 Z" fill="#0B1220" />
    </svg>
    {!collapsed && (
      <span className="text-[17px] font-extrabold tracking-tight" style={{ color: '#E8ECF4', fontFamily: 'var(--font-body)' }}>
        Pay<span style={{ color: '#D4F564' }}>Gate</span>
      </span>
    )}
  </div>
);
