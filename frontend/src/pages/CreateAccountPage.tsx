// ═══════════════════════════════════════════════════════════════
// PayGate Create Account / Sign-Up Page (/signup & /register)
// Full validation, password strength meter, plan query param,
// terms checkbox, and social authentication options.
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mascot } from '@/components/icons/Mascot';
import { Logo } from '@/components/icons/Logo';
import { useToast } from '@/components/ui/Toast';

export const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { addToast } = useToast();
  const reduced = useReducedMotion();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Plan Selection from URL (?plan=developer | scale | enterprise)
  const initialPlan = searchParams.get('plan') || 'scale';
  const [selectedPlan, setSelectedPlan] = useState<'developer' | 'scale' | 'enterprise'>(
    initialPlan === 'developer' || initialPlan === 'enterprise' ? initialPlan : 'scale'
  );

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successVerification, setSuccessVerification] = useState(false);

  // Sync plan if URL param changes
  useEffect(() => {
    const p = searchParams.get('plan');
    if (p === 'developer' || p === 'scale' || p === 'enterprise') {
      setSelectedPlan(p);
    }
  }, [searchParams]);

  // Password Strength Calculations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-400', 'bg-emerald-400'];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!businessName.trim()) errs.businessName = 'Business or Organization name is required';
    if (!email.trim()) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid work email';
    }
    if (!hasMinLength) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) errs.terms = 'You must accept the terms of service';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        username: email,
        password,
        organizationName: businessName,
        fullName,
        role: 'TENANT_ADMIN',
      });
      addToast(`Merchant account created for ${businessName}!`, 'success');
      setSuccessVerification(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: 'google' | 'github') => {
    addToast(`Connecting with ${provider}... Initializing merchant sandbox.`, 'info');
    setTimeout(async () => {
      try {
        await register({
          username: `user_${provider}@acmepay.dev`,
          password: 'Password@123',
          organizationName: 'Acme Payments Sandbox',
          fullName: 'Developer Sandbox',
          role: 'TENANT_ADMIN',
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message);
      }
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
      {/* Top Navigation Row: Back to Home */}
      <div className="w-full max-w-[480px] mb-4 flex items-center justify-between z-10 px-1">
        <Link
          to="/"
          className="text-xs font-semibold text-[#A3B3D2] hover:text-[#D4F564] transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to home</span>
        </Link>
        <span className="text-[11px] font-mono text-[#7A8CAE]">Merchant Portal</span>
      </div>

      {/* Decorative Mascot */}
      <div className="mb-3 z-10 flex flex-col items-center">
        <Mascot size={64} mood={error ? 'thinking' : loading ? 'wink' : 'wave'} />
      </div>

      {/* Sign-Up Card */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-[480px] rounded-[16px] bg-[#14203A] border border-white/15 p-8 sm:p-10 shadow-2xl z-10 relative"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity mb-3">
            <Logo className="scale-110" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Create Merchant Account
          </h1>
          <p className="text-xs text-[#A3B3D2] mt-1.5 leading-relaxed">
            Deploy your dedicated payment gateway instance with zero downtime
          </p>
        </div>

        {/* Success Verification Modal/Banner */}
        {successVerification && (
          <div className="mb-5 p-4 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-1">
            <div className="font-bold text-sm text-emerald-400">✓ Account Provisioned Successfully</div>
            <p>Verification link sent to your email. Redirecting to your dashboard...</p>
          </div>
        )}

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

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialSignup('google')}
            className="h-11 px-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignup('github')}
            className="h-11 px-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative text-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#14203A] text-[11px] font-mono uppercase tracking-wider text-[#A3B3D2]">
            or continue with email
          </span>
        </div>

        {/* Main Form Fields */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name & Business Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-white mb-1.5">
                Full name
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                placeholder="Alex Mercer"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: undefined });
                }}
                className={`w-full h-11 px-3.5 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] focus:outline-none ${
                  fieldErrors.fullName
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-white/15 focus:border-[#D4F564]'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-bizname" className="block text-xs font-semibold text-white mb-1.5">
                Business name
              </label>
              <input
                id="reg-bizname"
                type="text"
                required
                placeholder="Acme Pay Ltd"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (fieldErrors.businessName) setFieldErrors({ ...fieldErrors, businessName: undefined });
                }}
                className={`w-full h-11 px-3.5 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] focus:outline-none ${
                  fieldErrors.businessName
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-white/15 focus:border-[#D4F564]'
                }`}
              />
              {fieldErrors.businessName && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.businessName}</p>
              )}
            </div>
          </div>

          {/* Work Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-white mb-1.5">
                Work email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className={`w-full h-11 px-3.5 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] focus:outline-none ${
                  fieldErrors.email
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-white/15 focus:border-[#D4F564]'
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-white mb-1.5">
                Phone <span className="text-[#7A8CAE] font-normal">(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] border border-white/15 bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] focus:outline-none focus:border-[#D4F564]"
              />
            </div>
          </div>

          {/* Target Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">Selected Plan Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'developer', name: 'Sandbox', price: '₹0' },
                { id: 'scale', name: 'Scale', price: '₹4,999/mo' },
                { id: 'enterprise', name: 'Enterprise', price: 'Custom' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedPlan(tier.id as any)}
                  className={`p-2.5 rounded-[8px] text-left border transition-all cursor-pointer ${
                    selectedPlan === tier.id
                      ? 'border-[#D4F564] bg-[#D4F564]/10 text-white'
                      : 'border-white/10 bg-[#0B1220] text-[#A3B3D2] hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{tier.name}</div>
                  <div className="text-[10px] font-mono text-[#D4F564]">{tier.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-white mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  className={`w-full h-11 pl-3.5 pr-10 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] font-mono focus:outline-none ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-white/15 focus:border-[#D4F564]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3B3D2] hover:text-white cursor-pointer text-xs"
                  aria-label="Toggle password view"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-white mb-1.5">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                }}
                className={`w-full h-11 px-3.5 rounded-[10px] border bg-[#0B1220] text-sm text-white placeholder:text-[#5A6E94] font-mono focus:outline-none ${
                  fieldErrors.confirmPassword
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-white/15 focus:border-[#D4F564]'
                }`}
              />
            </div>
          </div>

          {/* Password Strength Meter & Checklist */}
          {password && (
            <div className="p-3 rounded-[8px] bg-black/30 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A3B3D2]">Strength:</span>
                <span className="font-bold text-white">{strengthLabels[strengthScore - 1] || 'Weak'}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full ${
                      step <= strengthScore ? strengthColors[strengthScore - 1] : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                <span className={hasMinLength ? 'text-emerald-400' : 'text-gray-500'}>
                  {hasMinLength ? '✓' : '○'} 8+ characters
                </span>
                <span className={hasUppercase ? 'text-emerald-400' : 'text-gray-500'}>
                  {hasUppercase ? '✓' : '○'} Uppercase letter
                </span>
                <span className={hasNumber ? 'text-emerald-400' : 'text-gray-500'}>
                  {hasNumber ? '✓' : '○'} Number (0-9)
                </span>
                <span className={hasSymbol ? 'text-emerald-400' : 'text-gray-500'}>
                  {hasSymbol ? '✓' : '○'} Special character
                </span>
              </div>
            </div>
          )}

          {/* Terms & Privacy Checkbox */}
          <div className="pt-2">
            <div className="flex items-start gap-2.5">
              <input
                id="reg-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: undefined });
                }}
                className="w-4 h-4 mt-0.5 rounded border-gray-700 bg-[#0B1220] accent-[#D4F564] cursor-pointer shrink-0"
              />
              <label htmlFor="reg-terms" className="text-xs text-[#A3B3D2] leading-normal cursor-pointer select-none">
                I agree to the{' '}
                <Link to="/terms" className="text-[#D4F564] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#D4F564] hover:underline">
                  Privacy Policy
                </Link>
                , including PCI-DSS traffic routing compliance.
              </label>
            </div>
            {fieldErrors.terms && <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.terms}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#C8EC50] shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                <span>Provisioning Merchant Gateway...</span>
              </>
            ) : (
              <>
                <span>Create Merchant Account</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-[#A3B3D2]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D4F564] font-bold hover:underline ml-1">
              Sign in to console →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
