// ═══════════════════════════════════════════════════════════════
// PayGate Forgot Password Screen
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Logo } from '@/components/icons/Logo';
import { Mascot } from '@/components/icons/Mascot';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const reduced = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden bg-[#0B1220]"
      style={{
        backgroundImage: `radial-gradient(rgba(212, 245, 100, 0.08) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        backgroundPosition: '0 0, 18px 18px',
      }}
    >
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between z-10 px-1">
        <Link to="/login" className="text-xs font-semibold text-[#A3B3D2] hover:text-[#D4F564] transition-colors flex items-center gap-1.5">
          <span>←</span>
          <span>Back to sign in</span>
        </Link>
      </div>

      <div className="mb-3 z-10">
        <Mascot size={64} mood="thinking" />
      </div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-[420px] rounded-[16px] bg-[#14203A] border border-white/15 p-8 sm:p-10 shadow-2xl z-10"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity mb-3">
            <Logo className="scale-110" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Reset Password
          </h1>
          <p className="text-xs text-[#A3B3D2] mt-1.5 leading-relaxed">
            Enter your registered merchant email address and we will dispatch a secure recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
            <div className="font-bold text-sm text-emerald-400">✓ Recovery Link Dispatched</div>
            <p>If an account exists for <span className="font-mono font-bold text-white">{email}</span>, password reset instructions have been sent.</p>
            <div className="pt-2">
              <Link to="/login" className="inline-block py-2 px-4 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-bold text-xs">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-white mb-2">
                Work email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-[10px] border border-white/15 bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] focus:outline-none focus:border-[#D4F564]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#C8EC50] shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Transmitting link...' : 'Send Recovery Link →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
