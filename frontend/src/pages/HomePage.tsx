// ═══════════════════════════════════════════════════════════════
// PayGate Professional Homepage — Bank-Grade FinTech Fabric
// Full Layout Repair: Unified .pg-container, Section Rhythm,
// Scroll-Spy Navbar, Interactive Simulator, Architecture, SDKs,
// Pricing with Plan Routing, and 4-Column Footer.
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/icons/Logo';
import { Mascot } from '@/components/icons/Mascot';
import { BoltIcon, ShieldIcon, FlameIcon, CoinIcon } from '@/components/icons/SpotIcons';

type EndpointType = 'upi' | 'card' | 'refund';
type CodeTab = 'curl' | 'nodejs' | 'python' | 'java';

const CODE_EXAMPLES: Record<CodeTab, string> = {
  curl: `curl -X POST https://gateway.paygate.dev/api/v1/upi/collect \\
  -H "Authorization: Bearer pk_live_9xKm2nR4..." \\
  -H "X-Idempotency-Key: ord_8841_attempt_1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "ORD-2024-8841",
    "amount": 499900,
    "currency": "INR",
    "vpa": "merchant@okaxis"
  }'`,
  nodejs: `import { PayGate } from '@paygate/node';

const paygate = new PayGate({
  apiKey: process.env.PAYGATE_SECRET_KEY,
  timeoutMs: 3000,
});

const payment = await paygate.payments.collect({
  orderId: 'ORD-2024-8841',
  amount: 499900, // ₹4,999.00 in paise
  currency: 'INR',
  vpa: 'merchant@okaxis',
  idempotencyKey: 'ord_8841_attempt_1',
});

console.log(\`Captured: \${payment.id} in \${payment.latencyMs}ms\`);`,
  python: `from paygate import PayGate

client = PayGate(api_key="pk_live_9xKm2nR4...", timeout=3.0)

charge = client.payments.collect(
    order_id="ORD-2024-8841",
    amount=499900,
    currency="INR",
    vpa="merchant@okaxis",
    idempotency_key="ord_8841_attempt_1"
)

print(f"Status: {charge.status}, P99: {charge.latency_ms}ms")`,
  java: `PayGateClient client = PayGateClient.builder()
    .apiKey("pk_live_9xKm2nR4...")
    .connectTimeout(Duration.ofMillis(3000))
    .build();

PaymentResponse response = client.payments().collect(
    PaymentRequest.builder()
        .orderId("ORD-2024-8841")
        .amount(499900L)
        .currency("INR")
        .vpa("merchant@okaxis")
        .idempotencyKey("ord_8841_attempt_1")
        .build()
);`,
};

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Navigation & Scroll-spy State
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Live Gateway Simulator State
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType>('upi');
  const [rateLimitSlider, setRateLimitSlider] = useState(3000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState({
    status: 200,
    statusText: 'CAPTURED',
    latency: 6.4,
    remaining: 2999,
    txId: 'pay_9xKm2nR4',
    route: 'route_upi_collect',
    path: '/api/v1/upi/collect',
    timestamp: new Date().toISOString(),
  });

  const [simulationLogs, setSimulationLogs] = useState<Array<{ step: string; status: 'ok' | 'throttle'; ms: number }>>([
    { step: 'Edge TLS Termination', status: 'ok', ms: 1.2 },
    { step: 'Token Bucket Rate Limit Check (Capacity: 3000 RPM)', status: 'ok', ms: 1.8 },
    { step: 'Distributed Idempotency Hash Verified', status: 'ok', ms: 2.1 },
    { step: 'Upstream Core Acquirer Dispatched', status: 'ok', ms: 6.4 },
  ]);

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('curl');

  // Scroll spy tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'playground', 'architecture', 'sdks', 'pricing'];
      const scrollPos = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTestRequest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const isRateLimited = rateLimitSlider === 0;
      const status = isRateLimited ? 429 : 200;
      const statusText = isRateLimited ? 'RATE_LIMITED' : 'CAPTURED';
      const latency = isRateLimited ? 1.1 : Number((4.1 + Math.random() * 4.2).toFixed(1));
      const remaining = isRateLimited ? 0 : Math.max(0, rateLimitSlider - 1);
      const endpointDetails = {
        upi: { route: 'route_upi_collect', path: '/api/v1/upi/collect' },
        card: { route: 'route_cards_3ds', path: '/api/v1/charge/card' },
        refund: { route: 'route_refund_dispatcher', path: '/api/v1/refunds' },
      }[selectedEndpoint];

      setSimulatedResponse({
        status,
        statusText,
        latency,
        remaining,
        txId: isRateLimited ? 'err_ratelimit_burst' : `pay_${Math.random().toString(36).substring(2, 10)}`,
        route: endpointDetails.route,
        path: endpointDetails.path,
        timestamp: new Date().toISOString(),
      });

      setSimulationLogs(
        isRateLimited
          ? [
              { step: 'Edge TLS Termination', status: 'ok', ms: 0.9 },
              { step: 'Token Bucket Exceeded: 0 RPM Available (HTTP 429)', status: 'throttle', ms: 1.1 },
            ]
          : [
              { step: 'Edge TLS Termination', status: 'ok', ms: 1.0 },
              { step: `Token Bucket Check (${remaining} tokens remaining)`, status: 'ok', ms: 1.7 },
              { step: 'Distributed Idempotency Verified (Unique Key)', status: 'ok', ms: 2.3 },
              { step: 'Upstream Banking Core Synchronized', status: 'ok', ms: latency },
            ]
      );

      setIsSimulating(false);
    }, 420);
  };

  const copyToClipboard = (text: string, type: 'response' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'response') {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white selection:bg-[#D4F564] selection:text-[#0B1220] overflow-x-hidden font-sans">
      {/* ── Background Subtle Mesh Grid ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(212, 245, 100, 0.12) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
        aria-hidden="true"
      />

      {/* ═══════════════════════════════════════════════════════════════
          PART 2: NAVBAR (Sticky, Blurred, Aligned in .pg-container)
          ═══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B1220]/90 border-b border-white/10 transition-colors">
        <div className="pg-container flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="PayGate Homepage">
            <Logo className="scale-105 transition-transform group-hover:scale-110" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#A3B3D2]" aria-label="Main menu">
            {[
              { id: 'features', label: 'Pillars' },
              { id: 'playground', label: 'Live Simulator' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'sdks', label: 'Developer SDKs' },
              { id: 'pricing', label: 'Pricing' },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative py-1 transition-colors hover:text-white ${
                  activeSection === link.id ? 'text-[#D4F564]' : ''
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4F564] rounded-full"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Action Group */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[#A3B3D2] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>

            {/* Auth Buttons or Avatar Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-2 px-3.5 rounded-[10px] bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-[#D4F564] animate-pulse" />
                  <span>{user.username}</span>
                  <span className="text-[10px] opacity-60">▼</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 p-2 rounded-[12px] bg-[#14203A] border border-white/15 shadow-2xl z-50 text-xs">
                    <Link
                      to="/dashboard"
                      className="block py-2 px-3 rounded-[6px] hover:bg-white/10 font-bold text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Console Dashboard →
                    </Link>
                    <Link
                      to="/api-keys"
                      className="block py-2 px-3 rounded-[6px] hover:bg-white/10 text-[#A3B3D2] transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      API Keys
                    </Link>
                    <Link
                      to="/routes"
                      className="block py-2 px-3 rounded-[6px] hover:bg-white/10 text-[#A3B3D2] transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Route Rules
                    </Link>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 rounded-[6px] hover:bg-rose-500/20 text-rose-400 font-semibold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="py-2.5 px-4 rounded-[10px] text-xs font-bold text-[#A3B3D2] hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs hover:bg-[#C8EC50] shadow-md hover:shadow-lg transition-transform active:scale-98"
                >
                  <span>Create Account</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-[8px] bg-white/5 border border-white/10 text-[#A3B3D2]"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[8px] bg-white/5 border border-white/10 text-white"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-white/10 bg-[#0E1626] px-6 py-5 space-y-4"
            >
              <div className="flex flex-col gap-3 font-semibold text-sm text-[#A3B3D2]">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">
                  Pillars
                </a>
                <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">
                  Live Simulator
                </a>
                <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">
                  Architecture
                </a>
                <a href="#sdks" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">
                  Developer SDKs
                </a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">
                  Pricing
                </a>
              </div>
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs text-center"
                  >
                    Open Console Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-white font-bold text-xs text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs text-center"
                    >
                      Create Merchant Account →
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        {/* ═══════════════════════════════════════════════════════════════
            PART 3: HERO SECTION (Centered Axis, High Contrast, 4-Col Stats)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="section-padding text-center">
          <div className="pg-container flex flex-col items-center">
            {/* Top Badge */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-[#D4F564]/30 shadow-sm shadow-[#D4F564]/10 mb-6"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4F564] animate-ping" />
              <span className="text-xs sm:text-sm font-mono font-bold text-[#D4F564] tracking-wide">
                PayGate v2.4 • Distributed Payment Traffic Fabric
              </span>
            </motion.div>

            {/* H1 Heading with Non-Breaking Hyphen */}
            <motion.h1
              initial={reduced ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white max-w-[920px] leading-[1.1] tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              The High-Throughput Gateway Built for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F564] via-emerald-300 to-teal-200">
                Zero&#8209;Downtime
              </span>{' '}
              Payment Orchestration.
            </motion.h1>

            {/* Subtitle with High WCAG AA Contrast */}
            <motion.p
              initial={reduced ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="mt-6 text-base sm:text-lg md:text-xl text-[#A3B3D2] max-w-[700px] leading-relaxed"
            >
              Protect acquirer core banking endpoints with token-bucket rate limiting, sub-10ms P99 latency,
              distributed idempotency locks, and zero-downtime hot reloads for millions of merchant transactions.
            </motion.p>

            {/* Buttons Row */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full"
            >
              <Link
                to="/signup"
                className="py-3.5 px-7 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm hover:bg-[#C8EC50] shadow-lg shadow-[#D4F564]/15 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Create Free Merchant Account</span>
                <span className="text-base">→</span>
              </Link>

              <a
                href="#playground"
                className="py-3.5 px-7 rounded-[10px] bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/20 hover:border-white/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Interactive Simulator</span>
                <span className="text-base">↓</span>
              </a>

              <Link
                to="/login"
                className="py-3.5 px-5 rounded-[10px] text-[#A3B3D2] hover:text-white font-bold text-sm transition-colors"
              >
                Console Sign In
              </Link>
            </motion.div>

            {/* 4-Column Stats Bar */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.24 }}
              className="mt-16 w-full max-w-[1000px] p-6 rounded-[16px] bg-[#14203A]/80 border border-white/10 backdrop-blur-md shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center"
            >
              <div className="p-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#D4F564] font-mono">99.999%</div>
                <div className="text-xs sm:text-sm text-[#A3B3D2] font-semibold mt-1">SLA Uptime Target</div>
              </div>
              <div className="p-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">&lt; 8.4ms</div>
                <div className="text-xs sm:text-sm text-[#A3B3D2] font-semibold mt-1">P99 Gateway Overhead</div>
              </div>
              <div className="p-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">50,000+</div>
                <div className="text-xs sm:text-sm text-[#A3B3D2] font-semibold mt-1">Req / Sec Throughput</div>
              </div>
              <div className="p-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">₹0.00</div>
                <div className="text-xs sm:text-sm text-[#A3B3D2] font-semibold mt-1">Duplicate Debits</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 4: LIVE GATEWAY SIMULATOR (Full Container Width, Padded Inputs)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="playground" className="section-padding bg-[#0E172A]/50 border-y border-white/5">
          <div className="pg-container">
            {/* Rhythm: Label, Heading, Subtext */}
            <div className="text-center">
              <span className="section-label">Interactive Demo</span>
              <h2 className="section-title">Live Gateway Traffic Simulator</h2>
              <p className="section-subtitle">
                Inspect real-time token bucket rate consumption, sliding window throttling, and idempotency lock validation.
              </p>
            </div>

            {/* Container Box */}
            <div className="w-full bg-[#14203A] rounded-[20px] border border-white/15 p-6 sm:p-8 md:p-10 shadow-2xl">
              {/* Controls 3-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 border-b border-white/10">
                {/* 1. Endpoint Selector */}
                <div>
                  <label className="block text-xs uppercase font-mono text-[#D4F564] font-bold mb-3">
                    1. Select Payment Endpoint
                  </label>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { id: 'upi', label: 'POST /api/v1/upi/collect', desc: 'Real-time UPI Collect (3,000 RPM)' },
                      { id: 'card', label: 'POST /api/v1/charge/card', desc: 'Card 3DS Tokenized (1,200 RPM)' },
                      { id: 'refund', label: 'POST /api/v1/refunds', desc: 'Instant Payout / Refund (600 RPM)' },
                    ].map((ep) => (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => setSelectedEndpoint(ep.id as any)}
                        className={`p-3.5 rounded-[10px] text-left border transition-all cursor-pointer ${
                          selectedEndpoint === ep.id
                            ? 'border-[#D4F564] bg-[#D4F564]/10 text-white shadow-sm'
                            : 'border-white/10 bg-white/5 text-[#A3B3D2] hover:border-white/25 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold text-white">{ep.label}</div>
                        <div className="text-[11px] text-[#A3B3D2] mt-0.5">{ep.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rate Limiting Quota Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase font-mono text-[#D4F564] font-bold">
                      2. Sliding Window Quota
                    </label>
                    <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {rateLimitSlider} RPM
                    </span>
                  </div>
                  <div className="p-5 rounded-[12px] bg-white/5 border border-white/10 space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={rateLimitSlider}
                      onChange={(e) => setRateLimitSlider(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-gray-700 accent-[#D4F564] cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-mono text-[#A3B3D2]">
                      <span>0 RPM (Force 429)</span>
                      <span>5,000 RPM (Burst)</span>
                    </div>
                    <p className="text-xs text-[#A3B3D2] leading-relaxed">
                      Slide down to 0 to trigger an immediate <code className="text-rose-400 font-mono font-bold">HTTP 429 Too Many Requests</code> with rate limit retry headers.
                    </p>
                  </div>
                </div>

                {/* 3. Dispatch Button & Flight Path */}
                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-xs uppercase font-mono text-[#D4F564] font-bold mb-3">
                      3. Trigger Transmission
                    </label>
                    <button
                      type="button"
                      onClick={handleTestRequest}
                      disabled={isSimulating}
                      className="w-full h-12 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#C8EC50] shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                          <span>Routing Packet...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Simulated Request</span>
                          <span className="text-base">⚡</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Flow Steps Log */}
                  <div className="mt-4 p-4 rounded-[10px] bg-black/40 border border-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-[#A3B3D2] font-bold uppercase tracking-wider">
                      Fabric Pipeline Telemetry:
                    </div>
                    {simulationLogs.map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <span className={log.status === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                            {log.status === 'ok' ? '✓' : '✗'}
                          </span>
                          <span>{log.step}</span>
                        </span>
                        <span className="text-[#A3B3D2]">{log.ms}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Response Inspector Panel */}
              <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Edge Response Inspector
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        simulatedResponse.status === 200
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {simulatedResponse.status} {simulatedResponse.statusText}
                    </span>
                    <span className="text-xs font-mono text-[#D4F564] bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      {simulatedResponse.latency}ms P99
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            {
                              status: simulatedResponse.status,
                              route: simulatedResponse.route,
                              latency: `${simulatedResponse.latency}ms`,
                              transaction_id: simulatedResponse.txId,
                              rate_limit_remaining: simulatedResponse.remaining,
                            },
                            null,
                            2
                          ),
                          'response'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-xs text-[#A3B3D2] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedResponse ? '✓ Copied' : 'Copy JSON'}
                    </button>
                  </div>
                </div>

                {/* Preformatted Monospace Output */}
                <pre className="mt-4 p-5 rounded-[12px] bg-[#0B1220] border border-white/10 font-mono text-xs sm:text-sm text-[#E2E8F0] overflow-x-auto leading-relaxed">
                  <div>
                    <span className="text-gray-500">HTTP/1.1</span>{' '}
                    <span className={simulatedResponse.status === 200 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {simulatedResponse.status} {simulatedResponse.statusText}
                    </span>
                  </div>
                  <div className="text-gray-500">Date: {simulatedResponse.timestamp}</div>
                  <div>
                    <span className="text-[#A3B3D2]">X-PayGate-Route-Id:</span>{' '}
                    <span className="text-[#D4F564]">{simulatedResponse.route}</span>
                  </div>
                  <div>
                    <span className="text-[#A3B3D2]">X-RateLimit-Limit:</span>{' '}
                    <span className="text-white">{rateLimitSlider}</span>
                  </div>
                  <div>
                    <span className="text-[#A3B3D2]">X-RateLimit-Remaining:</span>{' '}
                    <span className={simulatedResponse.remaining > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {simulatedResponse.remaining}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A3B3D2]">X-Idempotency-Key-Status:</span>{' '}
                    <span className="text-emerald-400">COMMITTED_NO_DUPLICATE</span>
                  </div>
                  <div>
                    <span className="text-[#A3B3D2]">X-Gateway-Latency-Ms:</span>{' '}
                    <span className="text-[#D4F564]">{simulatedResponse.latency}ms</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 text-white">
                    {`{\n  "transaction_id": "${simulatedResponse.txId}",\n  "status": "${simulatedResponse.statusText}",\n  "currency": "INR",\n  "path": "${simulatedResponse.path}",\n  "gateway_node": "sg1-edge-cluster"\n}`}
                  </div>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 5: PILLARS / FEATURES (4 Equal Cards, Hover Lift, Spacing)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="section-padding">
          <div className="pg-container">
            <div className="text-center">
              <span className="section-label">Engineering Core</span>
              <h2 className="section-title">Why PayGate Beats Traditional API Proxies</h2>
              <p className="section-subtitle">
                Generic API gateways drop financial context. PayGate embeds sliding window rate limits, financial idempotency locks, and hot-reloadable policies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <BoltIcon className="scale-125" />,
                  color: 'text-[#D4F564] bg-[#D4F564]/10',
                  title: 'Token Bucket Limiter',
                  desc: 'In-memory concurrent ring buffer with Redis fallback protects bank acquirers from cascading 503 load spikes during merchant flash sales.',
                },
                {
                  icon: <ShieldIcon className="scale-125" />,
                  color: 'text-emerald-400 bg-emerald-400/10',
                  title: 'Distributed Idempotency',
                  desc: 'Guarantees zero duplicate debit transactions during flaky mobile drops by atomically reserving idempotency tokens in milliseconds.',
                },
                {
                  icon: <FlameIcon className="scale-125" />,
                  color: 'text-amber-400 bg-amber-400/10',
                  title: 'Zero-Downtime Hot Reload',
                  desc: 'Update routing paths, rate-limit thresholds, and timeout rules on live gateway nodes without restarting JVM processes or dropping packets.',
                },
                {
                  icon: <CoinIcon className="scale-125" />,
                  color: 'text-cyan-400 bg-cyan-400/10',
                  title: 'Multi-Tenant Isolation',
                  desc: 'Enforce strict organizational quotas, monthly volume caps, and role-based cryptographic access control across every merchant tenant.',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-7 rounded-[16px] bg-[#14203A] border border-white/10 hover:border-[#D4F564]/40 hover:-translate-y-1 transition-all shadow-md flex flex-col justify-between h-full"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-5 ${card.color}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2.5" style={{ fontFamily: 'var(--font-heading)' }}>
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3B3D2] leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 6: ARCHITECTURE SECTION (SVG/CSS Layer Diagram & Captions)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="architecture" className="section-padding bg-[#0E172A]/40 border-y border-white/5">
          <div className="pg-container">
            <div className="text-center">
              <span className="section-label">System Topology</span>
              <h2 className="section-title">Zero-Downtime Payment Fabric Architecture</h2>
              <p className="section-subtitle">
                An end-to-end distributed data plane: Client requests traverse intelligent rate limiters and idempotency locks before reaching upstream acquirers.
              </p>
            </div>

            {/* Architecture Diagram Box */}
            <div className="w-full bg-[#14203A] rounded-[20px] border border-white/15 p-6 sm:p-10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Layer 1: Client Ingress */}
                <div className="p-6 rounded-[14px] bg-[#0B1220] border border-white/10 space-y-4 text-center">
                  <div className="text-xs font-mono font-bold text-[#D4F564] uppercase tracking-wider">
                    Layer 1 • Merchant Ingress
                  </div>
                  <div className="space-y-2 text-xs font-mono text-[#A3B3D2]">
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">Mobile App SDK (iOS / Android)</div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">Web Checkout API Client</div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">Backend Microservice Worker</div>
                  </div>
                  <p className="text-[11px] text-[#A3B3D2] pt-2 border-t border-white/5">
                    Transmits TLS 1.3 signed payloads with client-generated idempotency keys.
                  </p>
                </div>

                {/* Layer 2: PayGate Fabric Core */}
                <div className="p-6 rounded-[16px] bg-gradient-to-b from-[#182747] to-[#121F38] border-2 border-[#D4F564]/50 shadow-xl space-y-4 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#D4F564] text-[#0B1220] font-mono text-[10px] font-extrabold uppercase">
                    PayGate Smart Gateway Core
                  </div>
                  <div className="space-y-2.5 text-xs font-mono text-white pt-2">
                    <div className="p-2.5 rounded bg-[#0B1220] border border-[#D4F564]/30 font-bold">
                      JWT Auth & API Key Validation
                    </div>
                    <div className="p-2.5 rounded bg-[#0B1220] border border-[#D4F564]/30 font-bold">
                      Sliding-Window Rate Limiter
                    </div>
                    <div className="p-2.5 rounded bg-[#0B1220] border border-[#D4F564]/30 font-bold">
                      Distributed Idempotency Engine
                    </div>
                    <div className="p-2.5 rounded bg-[#0B1220] border border-[#D4F564]/30 font-bold">
                      Dynamic Reverse Proxy Router
                    </div>
                  </div>
                  {/* Side Store Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[10px] font-mono text-[#A3B3D2]">
                    <span className="p-1.5 rounded bg-black/40">⚡ Redis Cluster</span>
                    <span className="p-1.5 rounded bg-black/40">💾 Version Config</span>
                  </div>
                </div>

                {/* Layer 3: Upstream Acquirers */}
                <div className="p-6 rounded-[14px] bg-[#0B1220] border border-white/10 space-y-4 text-center">
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Layer 3 • Banking Acquirers
                  </div>
                  <div className="space-y-2 text-xs font-mono text-[#A3B3D2]">
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">National UPI Switch Engine</div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">Visa / Mastercard 3DS Vault</div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/5">Instant Payout & Refund Core</div>
                  </div>
                  <p className="text-[11px] text-[#A3B3D2] pt-2 border-t border-white/5">
                    Guaranteed isolated traffic with automated circuit-breaker failover.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 7: DEVELOPER SDKs / CODE BLOCK
            ═══════════════════════════════════════════════════════════════ */}
        <section id="sdks" className="section-padding">
          <div className="pg-container">
            <div className="text-center">
              <span className="section-label">Developer First</span>
              <h2 className="section-title">One Gateway Endpoint. Any Language.</h2>
              <p className="section-subtitle">
                Plug PayGate into your existing stack in under five minutes with zero SDK lock-in.
              </p>
            </div>

            <div className="w-full bg-[#14203A] rounded-[18px] border border-white/15 overflow-hidden shadow-2xl">
              {/* Header Bar with Tabs and Copy Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0B1220] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 mr-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </span>
                  {(['curl', 'nodejs', 'python', 'java'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-3.5 py-1.5 rounded-[8px] text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeCodeTab === tab
                          ? 'bg-[#D4F564] text-[#0B1220] shadow-sm'
                          : 'text-[#A3B3D2] hover:text-white bg-white/5'
                      }`}
                    >
                      {tab === 'curl' ? 'cURL' : tab === 'nodejs' ? 'Node.js' : tab === 'python' ? 'Python' : 'Java (Spring)'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(CODE_EXAMPLES[activeCodeTab], 'code')}
                  className="px-3 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/15 text-xs text-[#A3B3D2] hover:text-white font-mono transition-colors cursor-pointer"
                >
                  {copiedCode ? '✓ Copied!' : 'Copy Snippet'}
                </button>
              </div>

              {/* Code Snippet Box */}
              <pre className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-[#E2E8F0] overflow-x-auto leading-relaxed bg-[#0B1220]/70">
                <code>{CODE_EXAMPLES[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 8: PRICING (No Badge Overlap, Inside Padding 48px Buttons)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="section-padding bg-[#0E172A]/40 border-y border-white/5">
          <div className="pg-container">
            <div className="text-center">
              <span className="section-label">Predictable Pricing</span>
              <h2 className="section-title">Built for High-Growth FinTechs</h2>
              <p className="section-subtitle">
                Transparent request quotas, dedicated support, and zero hidden per-transaction fee markups.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
              {/* Plan 1: Developer Sandbox */}
              <div className="p-8 rounded-[18px] bg-[#14203A] border border-white/10 flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-xs font-mono text-[#D4F564] uppercase font-bold tracking-wider">
                    Developer Sandbox
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-3 font-mono">₹0</div>
                  <p className="text-xs text-[#A3B3D2] mt-1.5">Free forever for development and testing</p>
                  <ul className="mt-8 space-y-3 text-xs sm:text-sm text-[#E2E8F0]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 100,000 requests / month
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 600 req/min rate limit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> In-memory idempotency locks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> Community developer support
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/signup?plan=developer"
                    className="w-full h-12 rounded-[10px] bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center transition-colors border border-white/15"
                  >
                    Start Free Sandbox
                  </Link>
                </div>
              </div>

              {/* Plan 2: Merchant Scale (Highlighted & Non-Overlapping Badge) */}
              <div className="p-8 rounded-[18px] bg-[#14203A] border-2 border-[#D4F564] shadow-2xl shadow-[#D4F564]/10 flex flex-col justify-between relative">
                {/* Badge placed properly inside card padding */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#D4F564] uppercase font-bold tracking-wider">
                      Merchant Scale
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#D4F564] text-[#0B1220] text-[10px] font-mono font-extrabold uppercase">
                      Most Popular
                    </span>
                  </div>

                  <div className="text-4xl font-extrabold text-white mt-2 font-mono">
                    ₹4,999<span className="text-xs font-sans text-[#A3B3D2] font-normal"> / month</span>
                  </div>
                  <p className="text-xs text-[#A3B3D2] mt-1.5">For scaling e-commerce & high-volume merchants</p>
                  <ul className="mt-8 space-y-3 text-xs sm:text-sm text-[#E2E8F0]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 10,000,000 requests / month
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 5,000 req/min burst rate limits
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> Distributed Redis idempotency
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> P95/P99 latency & audit logging
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> Priority Slack & email support
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/signup?plan=scale"
                    className="w-full h-12 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center hover:bg-[#C8EC50] shadow-md transition-colors"
                  >
                    Deploy Merchant Account →
                  </Link>
                </div>
              </div>

              {/* Plan 3: Enterprise Dedicated */}
              <div className="p-8 rounded-[18px] bg-[#14203A] border border-white/10 flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-xs font-mono text-[#D4F564] uppercase font-bold tracking-wider">
                    Enterprise Dedicated
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-3 font-mono">Custom</div>
                  <p className="text-xs text-[#A3B3D2] mt-1.5">For banking switches & payment aggregators</p>
                  <ul className="mt-8 space-y-3 text-xs sm:text-sm text-[#E2E8F0]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 100M+ requests / month
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> Multi-region private gateway clusters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> Custom HSM & PCI-DSS vault routing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 99.999% SLA uptime contract
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#D4F564] font-bold">✓</span> 24/7 dedicated engineering hotline
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/signup?plan=enterprise"
                    className="w-full h-12 rounded-[10px] bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center transition-colors border border-white/15"
                  >
                    Contact Enterprise Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PART 9: FINAL CTA BANNER & 4-COLUMN FOOTER
            ═══════════════════════════════════════════════════════════════ */}
        <section className="section-padding">
          <div className="pg-container">
            <div className="w-full p-8 sm:p-14 rounded-[24px] bg-gradient-to-b from-[#14203A] to-[#0A111F] border border-white/15 shadow-2xl text-center flex flex-col items-center">
              <div className="mb-4">
                <Mascot size={76} mood="happy" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
                Ready to orchestrate payments with zero downtime?
              </h2>
              <p className="text-sm sm:text-base text-[#A3B3D2] mt-3 max-w-xl">
                Deploy your dedicated merchant routing gateway in under 60 seconds with self-contained fallback.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="py-3.5 px-8 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm hover:bg-[#C8EC50] shadow-md transition-transform"
                >
                  Create Account Free →
                </Link>
                <Link
                  to="/login"
                  className="py-3.5 px-7 rounded-[10px] bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors border border-white/15"
                >
                  Merchant Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 4-Column FinTech Footer ── */}
      <footer className="border-t border-white/10 bg-[#070C16] py-14">
        <div className="pg-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
            {/* Col 1: Product */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Product</div>
              <ul className="space-y-2 text-xs text-[#A3B3D2]">
                <li><a href="#features" className="hover:text-white transition-colors">Traffic Fabric</a></li>
                <li><a href="#playground" className="hover:text-white transition-colors">Live Simulator</a></li>
                <li><a href="#architecture" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Limits</a></li>
              </ul>
            </div>

            {/* Col 2: Developers */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Developers</div>
              <ul className="space-y-2 text-xs text-[#A3B3D2]">
                <li><a href="https://docs.paygate.dev" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://docs.paygate.dev/api" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#sdks" className="hover:text-white transition-colors">SDK Libraries</a></li>
                <li><a href="https://github.com/ACHYUTKRCHAUDHARY/ApiGateWay" className="hover:text-white transition-colors">GitHub Repository</a></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Company</div>
              <ul className="space-y-2 text-xs text-[#A3B3D2]">
                <li><a href="mailto:contact@paygate.dev" className="hover:text-white transition-colors">About PayGate</a></li>
                <li><a href="mailto:security@paygate.dev" className="hover:text-white transition-colors">Security & Trust</a></li>
                <li><a href="mailto:careers@paygate.dev" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="mailto:support@paygate.dev" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Col 4: Legal & Status */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Status & Legal</div>
              <div className="inline-flex items-center gap-2 py-1 px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
              <ul className="space-y-2 text-xs text-[#A3B3D2] pt-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><span className="text-[11px] text-gray-500">PCI-DSS Level 1 Compliant</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3B3D2]">
            <div className="flex items-center gap-3">
              <Logo className="scale-90" />
              <span>© {new Date().getFullYear()} PayGate Technologies, Inc. All rights reserved.</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500">
              High-Throughput Gateway Engine • Version 2.4-RELEASE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
