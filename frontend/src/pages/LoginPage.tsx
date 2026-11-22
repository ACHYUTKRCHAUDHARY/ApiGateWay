// ═══════════════════════════════════════════════════════════════
// PayGate Login Page — Clean, Accessible, No Prefills
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mascot } from '@/components/icons/Mascot';
import { Logo } from '@/components/icons/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo, backendUrl, updateBackendUrl } = useAuth();
  const reduced = useReducedMotion();

  // Form states: EMPTY by default (no prefilled values)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status & validation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Advanced endpoint settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState(backendUrl || '');
  const [endpointSaved, setEndpointSaved] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Username or work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('admin') && !email.includes('gateway') && !email.includes('service')) {
      errors.email = 'Please enter a valid work email address or username';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ username: email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = async (role: 'platform' | 'tenant') => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo session initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendUrl(customEndpoint);
    setEndpointSaved(true);
    setTimeout(() => setEndpointSaved(false), 2000);
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
      {/* Top Navigation Row: Back to Home */}
      <div className="w-full max-w-[440px] mb-4 flex items-center justify-between z-10 px-1">
        <Link
          to="/"
          className="text-xs font-semibold text-[#A3B3D2] hover:text-[#D4F564] transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to home</span>
        </Link>
        <span className="text-[11px] font-mono text-[#7A8CAE]">v2.4-RELEASE</span>
      </div>

      {/* Decorative Mascot (Cleanly positioned above the card with zero overlap) */}
      <div className="mb-3 z-10 flex flex-col items-center">
        <Mascot size={64} mood={error ? 'thinking' : loading ? 'wink' : 'happy'} />
      </div>

      {/* Main Login Card (100% width, max-w 440px, 36-40px padding, 16px radius) */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-[440px] rounded-[16px] bg-[#14203A] border border-white/15 p-8 sm:p-10 shadow-2xl z-10 relative"
      >
        {/* Header */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity mb-3">
            <Logo className="scale-110" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Sign in to PayGate
          </h1>
          <p className="text-xs text-[#A3B3D2] mt-1.5 leading-relaxed">
            Enter your merchant credentials to access your control plane
          </p>
        </div>

        {/* General Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed"
          >
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form Fields (20px gap between fields, 8px label-to-input gap, 48px height) */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Work Email Field */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-white mb-2">
              Work email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              className={`w-full h-12 px-4 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] font-medium transition-colors focus:outline-none ${
                fieldErrors.email
                  ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-white/15 focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]/20'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-[11px] text-rose-400 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="text-xs font-semibold text-white">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#D4F564] hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                className={`w-full h-12 pl-4 pr-11 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] font-mono transition-colors focus:outline-none ${
                  fieldErrors.password
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-white/15 focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A3B3D2] hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-[11px] text-rose-400 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-[#0B1220] accent-[#D4F564] cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs text-[#A3B3D2] cursor-pointer select-none">
              Remember this device for 30 days
            </label>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#C8EC50] shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Access Divider */}
        <div className="mt-7 pt-6 border-t border-white/10">
          <div className="relative text-center mb-4">
            <span className="px-3 bg-[#14203A] text-[11px] font-mono uppercase tracking-wider text-[#A3B3D2]">
              or try a demo
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantDemo('platform')}
              className="h-11 px-3.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>⚡</span>
              <span>Platform Admin</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantDemo('tenant')}
              className="h-11 px-3.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>🏢</span>
              <span>Tenant Admin</span>
            </button>
          </div>
        </div>

        {/* Collapsed Advanced Gateway Connection */}
        <div className="mt-5 pt-3 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] font-mono text-[#7A8CAE] hover:text-[#D4F564] transition-colors cursor-pointer"
          >
            {showAdvanced ? '▲ Hide Advanced Connection' : '⚙ Advanced Connection Settings'}
          </button>

          {showAdvanced && (
            <form onSubmit={handleSaveEndpoint} className="mt-3 text-left space-y-2">
              <label htmlFor="custom-gateway" className="block text-[11px] font-mono text-[#A3B3D2]">
                Custom Gateway URL (Localhost or Cloud Render)
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-gateway"
                  type="url"
                  placeholder="https://smart-gateway-xxxx.onrender.com"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-[8px] bg-[#0B1220] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-[#D4F564]"
                />
                <button
                  type="submit"
                  className="px-3 h-9 rounded-[8px] bg-[#D4F564] text-[#0B1220] text-xs font-bold hover:bg-[#C8EC50] cursor-pointer"
                >
                  Save
                </button>
              </div>
              {endpointSaved && <p className="text-[11px] text-emerald-400 font-semibold">Endpoint updated!</p>}
            </form>
          )}
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-[#A3B3D2]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#D4F564] font-bold hover:underline ml-1">
              Create Merchant Account →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
