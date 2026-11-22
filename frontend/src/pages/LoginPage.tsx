import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mascot } from '@/components/icons/Mascot';
import { Logo } from '@/components/icons/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo, backendUrl, updateBackendUrl } = useAuth();
  const reduced = useReducedMotion();

  const [username, setUsername] = useState('platform-admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEndpointConfig, setShowEndpointConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(backendUrl || '');
  const [urlSaved, setUrlSaved] = useState(false);

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

  const handleInstantDemo = async (role: 'platform' | 'tenant') => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendUrl(customUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
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

      <div className="relative w-full max-w-[420px] mt-8">
        {/* Mascot peeking over the top edge */}
        <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <Mascot size={72} mood={error ? 'thinking' : loading ? 'wink' : 'happy'} />
        </div>

        {/* Card */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#1A2540] rounded-[16px] shadow-2xl p-7 border border-[rgba(255,255,255,0.08)] relative z-10"
        >
          <div className="text-center mb-5 pt-2">
            <h2 className="text-xl font-extrabold text-[#0B1220] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
              Sign in to PayGate
            </h2>
            <p className="text-xs text-[#5A6785] dark:text-[#8B9BC0] mt-1">
              Enter credentials or launch immediate demo access
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => handleInstantDemo('platform')}
                className="w-full py-1.5 px-3 rounded-[6px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Launch Sandbox Demo Mode Instead →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
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
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
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
              className="w-full h-11 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50 mt-2"
              style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}
            >
              {loading ? 'Connecting...' : 'Sign in to Dashboard →'}
            </motion.button>
          </form>

          {/* Instant 1-Click Demo Section */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="block label-caps text-center text-[#8B95A8] mb-2 font-bold tracking-wider">
              Instant 1-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemo('platform')}
                className="py-2 px-3 rounded-[6px] bg-[#E9EDF5] dark:bg-[#141E33] hover:bg-[#D5DAE6] dark:hover:bg-[#1E2C48] text-xs font-bold text-[#0B1220] dark:text-white transition-colors cursor-pointer border border-[rgba(255,255,255,0.06)] flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span>⚡</span>
                Platform Admin
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemo('tenant')}
                className="py-2 px-3 rounded-[6px] bg-[#E9EDF5] dark:bg-[#141E33] hover:bg-[#D5DAE6] dark:hover:bg-[#1E2C48] text-xs font-bold text-[#0B1220] dark:text-white transition-colors cursor-pointer border border-[rgba(255,255,255,0.06)] flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span>🏢</span>
                Tenant Admin
              </button>
            </div>
          </div>

          {/* Expandable Gateway URL config */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-center">
            <button
              type="button"
              onClick={() => setShowEndpointConfig(!showEndpointConfig)}
              className="text-[11px] text-[#8B9BC0] hover:text-[#D4F564] transition-colors font-medium cursor-pointer"
            >
              {showEndpointConfig ? '▲ Hide Gateway Settings' : '⚙ Configure Gateway Endpoint URL'}
            </button>

            {showEndpointConfig && (
              <form onSubmit={handleSaveEndpoint} className="mt-2.5 space-y-2 text-left">
                <label className="block text-[10px] uppercase font-mono text-[#8B9BC0]">
                  Target Backend URL (Render or Localhost)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://your-service.onrender.com or empty"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-[6px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-xs text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-[6px] bg-[#D4F564] text-[#0B1220] text-xs font-bold hover:bg-[#C8EC50] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                {urlSaved && (
                  <p className="text-[10px] text-emerald-400 font-semibold">Backend URL saved!</p>
                )}
                <p className="text-[10px] text-[#8B9BC0]/80 leading-normal">
                  Leave empty for default sandbox or enter your deployed Render backend URL.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
