import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mascot } from '@/components/icons/Mascot';
import { Logo } from '@/components/icons/Logo';
import { useToast } from '@/components/ui/Toast';

export const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginDemo } = useAuth();
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  const [orgName, setOrgName] = useState('Acme Payments Ltd');
  const [fullName, setFullName] = useState('Alex Mercer');
  const [username, setUsername] = useState('alex.mercer');
  const [password, setPassword] = useState('Password@123');
  const [confirmPassword, setConfirmPassword] = useState('Password@123');
  const [tier, setTier] = useState<'developer' | 'scale' | 'enterprise'>('scale');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        password,
        organizationName: orgName,
        fullName,
        role: 'TENANT_ADMIN',
      });
      addToast(`Welcome to PayGate, ${orgName}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRegister = async () => {
    setLoading(true);
    try {
      await loginDemo('tenant');
      addToast('Logged into Merchant Sandbox account', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1220 0%, #14203A 100%)' }}
    >
      <div className="mb-6 flex flex-col items-center">
        <Link to="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <Logo className="scale-125 mb-2" />
        </Link>
        <p className="text-xs text-[#8B9BC0] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
          Merchant Payment Gateway Control Plane
        </p>
      </div>

      <div className="relative w-full max-w-[480px] mt-6">
        {/* Mascot peeking over card edge */}
        <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <Mascot size={72} mood={error ? 'thinking' : loading ? 'wink' : 'wave'} />
        </div>

        {/* Form Card */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#1A2540] rounded-[16px] shadow-2xl p-7 border border-[rgba(255,255,255,0.08)] relative z-10"
        >
          <div className="text-center mb-6 pt-2">
            <h2 className="text-xl font-extrabold text-[#0B1220] dark:text-white" style={{ fontFamily: 'var(--font-body)' }}>
              Create Merchant Account
            </h2>
            <p className="text-xs text-[#5A6785] dark:text-[#8B9BC0] mt-1">
              Deploy your high-throughput payment routing workspace in seconds
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
                Organization / Merchant Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Payments Pvt Ltd"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-medium focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-medium focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
                />
              </div>

              <div>
                <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
                  Username / Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex.mercer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
                />
              </div>

              <div>
                <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-sm text-[#0B1220] dark:text-white font-mono focus:outline-none focus:border-[#D4F564] focus:ring-2 focus:ring-[#D4F564]"
                />
              </div>
            </div>

            {/* Gateway Tier Selection */}
            <div>
              <label className="block label-caps text-[#5A6785] dark:text-[#8B9BC0] mb-1.5">
                Target Gateway Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'developer', name: 'Sandbox', limit: '100k req/mo' },
                  { id: 'scale', name: 'Merchant', limit: '10M req/mo' },
                  { id: 'enterprise', name: 'Enterprise', limit: '50M+ req/mo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id as any)}
                    className={`p-2 rounded-[8px] text-left border transition-all cursor-pointer ${
                      tier === t.id
                        ? 'border-[#D4F564] bg-[#D4F564]/10 text-[#0B1220] dark:text-white'
                        : 'border-[#D5DAE6] dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#141E33] text-[#5A6785] dark:text-[#8B9BC0]'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{t.name}</div>
                    <div className="text-[10px] opacity-75 font-mono">{t.limit}</div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={reduced ? {} : { scale: 1.01 }}
              whileTap={reduced ? {} : { scale: 0.98 }}
              className="w-full h-11 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C8EC50] transition-colors cursor-pointer disabled:opacity-50 mt-3"
              style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}
            >
              {loading ? 'Provisioning Gateway Workspace...' : 'Create Account & Launch Console →'}
            </motion.button>
          </form>

          {/* Quick Access Sandbox */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center space-y-3">
            <p className="text-xs text-[#5A6785] dark:text-[#8B9BC0]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0B1220] dark:text-[#D4F564] font-bold hover:underline">
                Sign in here
              </Link>
            </p>

            <button
              type="button"
              onClick={handleQuickDemoRegister}
              className="text-xs text-[#8B9BC0] hover:text-[#D4F564] transition-colors font-medium underline underline-offset-4 cursor-pointer"
            >
              Skip setup & launch Instant Merchant Sandbox
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
