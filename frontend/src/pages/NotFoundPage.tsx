// ═══════════════════════════════════════════════════════════════
// PayGate 404 Not Found Page
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/icons/Logo';
import { Mascot } from '@/components/icons/Mascot';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-6 text-center">
      <Link to="/" className="mb-8 hover:opacity-90">
        <Logo className="scale-125" />
      </Link>

      <div className="mb-6">
        <Mascot size={96} mood="thinking" />
      </div>

      <div className="text-6xl font-extrabold text-[#D4F564] font-mono mb-2">404</div>
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Route Not Found
      </h1>
      <p className="text-sm text-[#A3B3D2] max-w-md mb-8 leading-relaxed">
        The requested gateway endpoint or path is unmapped in the PayGate routing table.
      </p>

      <div className="flex gap-3">
        <Link
          to="/"
          className="py-3 px-6 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs hover:bg-[#C8EC50] transition-colors"
        >
          Return to Homepage
        </Link>
        <Link
          to="/dashboard"
          className="py-3 px-6 rounded-[10px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors border border-white/15"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
};
