import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mascot } from '@/components/icons/Mascot';
import { Logo } from '@/components/icons/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const reduced = useReducedMotion();

  const [username, setUsername] = useState('platform-admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1220 0%, #14203A 100%)' }}
    >
      <div className="mb-6 flex flex-col items-center">
        <Logo className="scale-125 mb-2" />
        <p className="text-xs text-[#8B9BC0] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
          Merchant Payment Gateway Control Plane
        </p>
      </div>

      <div className="relative w-full max-w-[400px] mt-8">
        {/* Mascot peeking over the top edge */}
        <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <Mascot size={72} mood="happy" />
        </div>

        {/* Card */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#1A2540] rounded-[16px] shadow-2xl p-8 border border-[rgba(255,255,255,0.08)] relative z-10"
        >
          <div className="text-center mb-6 pt-2">
            <h2 className="text-xl font-extrabold text-[#0B1220] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
              Sign in to PayGate
            </h2>
            <p className="text-xs text-[#5A6785] dark:text-[#8B9BC0] mt-1">
              Enter credentials to access your gateway console
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1.5">
                Username / Identifier
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
              />
            </div>

            <div>
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={reduced ? {} : { scale: 1.01 }}
              whileTap={reduced ? {} : { scale: 0.98 }}
              className="w-full h-12 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50 mt-2"
              style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}
            >
              {loading ? 'Authenticating...' : 'Sign in to Dashboard →'}
            </motion.button>
          </form>

          {/* Preset Buttons */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <span className="block label-caps text-center text-[#8B95A8] mb-2.5">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreset('platform-admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-[6px] bg-[#E9EDF5] dark:bg-gray-800 hover:bg-[#D5DAE6] text-[11px] font-bold text-[#0B1220] dark:text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Platform Admin
              </button>
              <button
                type="button"
                onClick={() => setPreset('tenant-admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-[6px] bg-[#E9EDF5] dark:bg-gray-800 hover:bg-[#D5DAE6] text-[11px] font-bold text-[#0B1220] dark:text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Tenant Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
