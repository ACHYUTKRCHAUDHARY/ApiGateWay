import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/icons/Logo';
import { Mascot } from '@/components/icons/Mascot';
import { BoltIcon, ShieldIcon, FlameIcon, CoinIcon } from '@/components/icons/SpotIcons';

type EndpointType = 'upi' | 'card' | 'refund';

const CODE_EXAMPLES = {
  curl: `curl -X POST https://gateway.paygate.dev/api/v1/upi/collect \\
  -H "Authorization: Bearer pk_live_9xKm2nR4..." \\
  -H "X-Idempotency-Key: ord_8841_attempt_1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "ORD-2024-8841",
    "amount": 499900,
    "currency": "INR",
    "vpa": "riya@okaxis"
  }'`,
  nodejs: `import { PayGate } from '@paygate/node';

const paygate = new PayGate({ apiKey: process.env.PAYGATE_KEY });

const payment = await paygate.payments.create({
  amount: 499900,
  currency: 'INR',
  method: 'upi',
  vpa: 'riya@okaxis',
  idempotencyKey: 'ord_8841_attempt_1',
});

console.log(\`Captured: \${payment.id} in \${payment.latencyMs}ms\`);`,
  python: `from paygate import PayGate

client = PayGate(api_key="pk_live_9xKm2nR4...")

charge = client.payments.charge(
    amount=499900,
    currency="INR",
    method="upi",
    vpa="riya@okaxis",
    idempotency_key="ord_8841_attempt_1"
)

print(f"Status: {charge.status}, P99: {charge.latency_ms}ms")`,
  java: `PayGateClient client = PayGateClient.builder()
    .apiKey("pk_live_9xKm2nR4...")
    .build();

PaymentResponse response = client.payments().collect(
    PaymentRequest.builder()
        .amount(499900L)
        .currency("INR")
        .idempotencyKey("ord_8841_attempt_1")
        .vpa("riya@okaxis")
        .build()
);`,
};

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Interactive Gateway Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType>('upi');
  const [rateLimitSlider, setRateLimitSlider] = useState(3000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<{
    status: number;
    latency: number;
    remaining: number;
    txId: string;
    route: string;
  }>({
    status: 200,
    latency: 6.4,
    remaining: 2999,
    txId: 'pay_9xKm2nR4',
    route: 'route_upi_collect',
  });

  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'nodejs' | 'python' | 'java'>('curl');

  const handleTestRequest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const isRateLimited = rateLimitSlider < 50;
      const status = isRateLimited ? 429 : 200;
      const latency = Number((4.2 + Math.random() * 5).toFixed(1));
      const remaining = isRateLimited ? 0 : Math.max(0, rateLimitSlider - 1);
      const routeMap = {
        upi: 'route_upi_collect',
        card: 'route_cards_3ds',
        refund: 'route_refund_dispatcher',
      };
      setSimulatedResponse({
        status,
        latency,
        remaining,
        txId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        route: routeMap[selectedEndpoint],
      });
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white selection:bg-[#D4F564] selection:text-[#0B1220] overflow-x-hidden font-sans">
      {/* ── Background Mesh Grid ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(212, 245, 100, 0.15) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* ── Header / Navigation Bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B1220]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo className="scale-105" />
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-[#8B9BC0] font-medium">
              <a href="#features" className="hover:text-white transition-colors">
                Pillars
              </a>
              <a href="#playground" className="hover:text-white transition-colors">
                Live Simulator
              </a>
              <a href="#architecture" className="hover:text-white transition-colors">
                Architecture
              </a>
              <a href="#sdks" className="hover:text-white transition-colors">
                Developer SDKs
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#8B9BC0] hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-bold text-xs hover:bg-[#C8EC50] transition-transform cursor-pointer"
              >
                <span>Console Dashboard</span>
                <span>→</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-[#8B9BC0] hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-bold text-xs hover:bg-[#C8EC50] shadow-sm transition-transform cursor-pointer"
                >
                  Create Account
                  <span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-6 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#D4F564] mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-[#D4F564] animate-ping" />
          <span>PayGate v2.4 • Distributed Payment Traffic Fabric</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          The High-Throughput Gateway Built for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F564] via-emerald-300 to-teal-200">
            Zero-Downtime
          </span>{' '}
          Payment Orchestration.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#8B9BC0] max-w-3xl mx-auto leading-relaxed"
        >
          Protect acquirer core banking endpoints with token-bucket rate limiting, sub-10ms P99 latency,
          distributed idempotency locks, and zero-downtime hot reloads for millions of merchant transactions.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm hover:bg-[#C8EC50] shadow-lg shadow-[#D4F564]/10 transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>Create Free Merchant Account</span>
            <span>→</span>
          </Link>

          <a
            href="#playground"
            className="px-6 py-3.5 rounded-[10px] bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 transition-all flex items-center gap-2"
          >
            <span>Interactive Simulator</span>
            <span>↓</span>
          </a>

          <button
            onClick={() => navigate('/login')}
            className="px-5 py-3.5 rounded-[10px] text-[#8B9BC0] hover:text-white text-sm font-semibold transition-colors"
          >
            Console Sign In
          </button>
        </motion.div>

        {/* Live Metrics Bar */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-[16px] bg-[#14203A]/60 border border-white/10 backdrop-blur-md max-w-4xl mx-auto text-left"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#D4F564] font-mono">99.999%</div>
            <div className="text-xs text-[#8B9BC0] font-medium mt-0.5">SLA Uptime Target</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 8.4ms</div>
            <div className="text-xs text-[#8B9BC0] font-medium mt-0.5">P99 Gateway Overhead</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">50,000+</div>
            <div className="text-xs text-[#8B9BC0] font-medium mt-0.5">Req / Sec Throughput</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">₹0.00</div>
            <div className="text-xs text-[#8B9BC0] font-medium mt-0.5">Duplicate Debits</div>
          </div>
        </motion.div>
      </section>

      {/* ── Interactive Live Gateway Playground (Generative UI) ── */}
      <section id="playground" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4F564]">Interactive Demo</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Live Gateway Traffic Simulator
          </h2>
          <p className="text-sm text-[#8B9BC0] mt-2 max-w-xl mx-auto">
            Test how PayGate matches route rules, validates idempotency keys, and enforces sliding window rate limits.
          </p>
        </div>

        <div className="bg-[#14203A] rounded-[20px] border border-white/10 p-6 md:p-8 shadow-2xl">
          {/* Controls row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 border-b border-white/10">
            <div>
              <label className="block text-xs uppercase font-mono text-[#8B9BC0] mb-2 font-bold">
                1. Select Payment Endpoint
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'upi', label: 'POST /api/v1/upi/collect', desc: 'Real-time UPI Collect (3,000 RPM)' },
                  { id: 'card', label: 'POST /api/v1/charge/card', desc: 'Card 3DS Tokenized (1,200 RPM)' },
                  { id: 'refund', label: 'POST /api/v1/refunds', desc: 'Instant Payout / Refund (600 RPM)' },
                ].map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep.id as any)}
                    className={`p-3 rounded-[10px] text-left border transition-all cursor-pointer ${
                      selectedEndpoint === ep.id
                        ? 'border-[#D4F564] bg-[#D4F564]/10 text-white'
                        : 'border-white/10 bg-white/5 text-[#8B9BC0] hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-[#D4F564]">{ep.label}</div>
                    <div className="text-[11px] text-[#8B9BC0] mt-0.5">{ep.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#8B9BC0] mb-2 font-bold">
                2. Rate Limiting Quota (RPM: {rateLimitSlider})
              </label>
              <div className="p-4 rounded-[10px] bg-white/5 border border-white/10 space-y-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={rateLimitSlider}
                  onChange={(e) => setRateLimitSlider(Number(e.target.value))}
                  className="w-full accent-[#D4F564] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#8B9BC0]">
                  <span>0 RPM (Throttle)</span>
                  <span>5,000 RPM (Burst)</span>
                </div>
                <p className="text-[11px] text-[#8B9BC0]/80">
                  Slide down to 0 to trigger a real <code className="text-rose-400">HTTP 429 Too Many Requests</code> with rate limit headers.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs uppercase font-mono text-[#8B9BC0] mb-2 font-bold">
                  3. Dispatch Packet
                </label>
                <button
                  onClick={handleTestRequest}
                  disabled={isSimulating}
                  className="w-full py-3.5 px-4 rounded-[10px] bg-[#D4F564] text-[#0B1220] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#C8EC50] shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Packet...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Simulated Request</span>
                      <span>⚡</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-[8px] bg-black/30 border border-white/5 text-[11px] text-[#8B9BC0] font-mono">
                ✓ Guaranteed Idempotency Key injected
                <br />✓ Sliding window counter evaluated
              </div>
            </div>
          </div>

          {/* Response Terminal Window */}
          <div className="mt-6">
            <div className="flex items-center justify-between pb-2 text-xs font-mono text-[#8B9BC0]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 text-white font-bold">Edge Response Inspector</span>
              </span>
              <span className="text-[#D4F564]">{simulatedResponse.latency} ms roundtrip</span>
            </div>

            <pre className="p-4 rounded-[12px] bg-[#0B1220] border border-white/10 font-mono text-xs overflow-x-auto text-[#C5D0E6] leading-relaxed">
              <div>
                <span className={simulatedResponse.status === 200 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  HTTP/1.1 {simulatedResponse.status} {simulatedResponse.status === 200 ? 'OK' : 'Too Many Requests'}
                </span>
              </div>
              <div className="text-gray-400">Date: {new Date().toUTCString()}</div>
              <div>
                <span className="text-[#8B9BC0]">X-PayGate-Route-Id:</span> <span className="text-white">{simulatedResponse.route}</span>
              </div>
              <div>
                <span className="text-[#8B9BC0]">X-RateLimit-Limit:</span> <span className="text-white">{rateLimitSlider}</span>
              </div>
              <div>
                <span className="text-[#8B9BC0]">X-RateLimit-Remaining:</span>{' '}
                <span className={simulatedResponse.remaining > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {simulatedResponse.remaining}
                </span>
              </div>
              <div>
                <span className="text-[#8B9BC0]">X-Idempotency-Status:</span> <span className="text-emerald-400">COMMITTED_NO_DUPLICATE</span>
              </div>
              <div>
                <span className="text-[#8B9BC0]">X-Gateway-Latency:</span> <span className="text-[#D4F564]">{simulatedResponse.latency}ms</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 text-white">
                {`{\n  "transaction_id": "${simulatedResponse.txId}",\n  "status": "${simulatedResponse.status === 200 ? 'CAPTURED' : 'RATE_LIMITED'}",\n  "currency": "INR",\n  "gateway_node": "sg1-prod-edge"\n}`}
              </div>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Architecture Pillars ── */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4F564]">Engineering Core</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Why PayGate Beats Traditional API Proxies
          </h2>
          <p className="text-sm text-[#8B9BC0] mt-2 max-w-2xl mx-auto">
            Traditional reverse proxies lack payment-domain semantics. PayGate combines network routing with financial idempotency and tenant rate governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 hover:border-[#D4F564]/40 transition-colors">
            <div className="w-12 h-12 rounded-[12px] bg-[#D4F564]/10 flex items-center justify-center text-[#D4F564] mb-4">
              <BoltIcon className="scale-125" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Token Bucket Limiter</h3>
            <p className="text-xs text-[#8B9BC0] leading-relaxed">
              In-memory concurrent ring buffer with Redis backup prevents cascading bank timeouts while allowing legitimate merchant bursts.
            </p>
          </div>

          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 hover:border-[#D4F564]/40 transition-colors">
            <div className="w-12 h-12 rounded-[12px] bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldIcon className="scale-125" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Distributed Idempotency</h3>
            <p className="text-xs text-[#8B9BC0] leading-relaxed">
              Guarantees zero duplicate debit transactions during mobile connection drops by atomically reserving idempotency hashes.
            </p>
          </div>

          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 hover:border-[#D4F564]/40 transition-colors">
            <div className="w-12 h-12 rounded-[12px] bg-amber-400/10 flex items-center justify-center text-amber-400 mb-4">
              <FlameIcon className="scale-125" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero-Downtime Hot Reload</h3>
            <p className="text-xs text-[#8B9BC0] leading-relaxed">
              Update rate quotas, add new acquirer endpoints, and rotate keys without restarting JVM instances or dropping packets.
            </p>
          </div>

          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 hover:border-[#D4F564]/40 transition-colors">
            <div className="w-12 h-12 rounded-[12px] bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-4">
              <CoinIcon className="scale-125" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Quota</h3>
            <p className="text-xs text-[#8B9BC0] leading-relaxed">
              Isolate merchants with distinct organization boundaries, monthly volume caps, and granular route version rollback.
            </p>
          </div>
        </div>
      </section>

      {/* ── Developer SDKs Section ── */}
      <section id="sdks" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4F564]">Developer Experience</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            One Gateway Endpoint. Any Language.
          </h2>
        </div>

        <div className="bg-[#14203A] rounded-[16px] border border-white/10 overflow-hidden shadow-2xl">
          {/* Language Tabs */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0B1220] border-b border-white/10">
            {(['curl', 'nodejs', 'python', 'java'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCodeTab === tab
                    ? 'bg-[#D4F564] text-[#0B1220]'
                    : 'text-[#8B9BC0] hover:text-white bg-white/5'
                }`}
              >
                {tab === 'curl' ? 'cURL' : tab === 'nodejs' ? 'Node.js' : tab === 'python' ? 'Python' : 'Java (Spring)'}
              </button>
            ))}
          </div>

          <pre className="p-6 font-mono text-xs text-[#D5DAE6] overflow-x-auto leading-relaxed bg-[#0B1220]/60">
            <code>{CODE_EXAMPLES[activeCodeTab]}</code>
          </pre>
        </div>
      </section>

      {/* ── Pricing & Quotas ── */}
      <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4F564]">Predictable Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Built for High-Growth FinTechs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-[#D4F564] uppercase font-bold">Developer Sandbox</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">₹0</div>
              <p className="text-xs text-[#8B9BC0] mt-1">Free forever for staging & testing</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#C5D0E6]">
                <li>✓ 100,000 requests / month</li>
                <li>✓ 600 req/min rate limit</li>
                <li>✓ In-memory idempotency</li>
                <li>✓ Community Slack support</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded-[8px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              Start Free Sandbox
            </Link>
          </div>

          <div className="p-6 rounded-[16px] bg-[#14203A] border-2 border-[#D4F564] relative shadow-xl shadow-[#D4F564]/5 flex flex-col justify-between">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#D4F564] text-[#0B1220] text-[10px] font-extrabold font-mono uppercase">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-mono text-[#D4F564] uppercase font-bold">Merchant Scale</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">₹4,999<span className="text-xs text-[#8B9BC0]">/mo</span></div>
              <p className="text-xs text-[#8B9BC0] mt-1">For live commerce & high-volume SaaS</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#C5D0E6]">
                <li>✓ 10,000,000 requests / month</li>
                <li>✓ 5,000 req/min burst limits</li>
                <li>✓ Distributed Redis idempotency</li>
                <li>✓ P99 latency analytics & audit</li>
                <li>✓ Dedicated Slack & email support</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs hover:bg-[#C8EC50] transition-colors"
            >
              Deploy Merchant Account →
            </Link>
          </div>

          <div className="p-6 rounded-[16px] bg-[#14203A] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-[#D4F564] uppercase font-bold">Enterprise Cluster</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">Custom</div>
              <p className="text-xs text-[#8B9BC0] mt-1">For banking switches & payment aggregators</p>
              <ul className="mt-6 space-y-2.5 text-xs text-[#C5D0E6]">
                <li>✓ 100M+ requests / month</li>
                <li>✓ Multi-region edge clusters</li>
                <li>✓ Custom HSM & PCI vault routing</li>
                <li>✓ 99.999% SLA guarantee</li>
                <li>✓ 24/7 dedicated telephone hotline</li>
              </ul>
            </div>
            <a
              href="mailto:enterprise@paygate.dev"
              className="mt-8 block text-center py-2.5 px-4 rounded-[8px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── Mascot CTA Banner ── */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-[24px] bg-gradient-to-b from-[#14203A] to-[#0E172A] border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-center mb-4">
            <Mascot size={80} mood="happy" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Ready to route payments with zero downtime?
          </h2>
          <p className="text-xs sm:text-sm text-[#8B9BC0] mt-2 max-w-lg mx-auto">
            Deploy PayGate in your infrastructure or launch our cloud merchant console in under 60 seconds.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-[8px] bg-[#D4F564] text-[#0B1220] font-extrabold text-xs hover:bg-[#C8EC50] shadow-md transition-transform"
            >
              Create Account Free →
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-[8px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              Merchant Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comprehensive Footer ── */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#080D17]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo className="scale-90" />
            <span className="text-xs text-[#8B9BC0]">
              © {new Date().getFullYear()} PayGate Systems, Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#8B9BC0]">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <a href="https://docs.paygate.dev" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="https://github.com/ACHYUTKRCHAUDHARY/ApiGateWay" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
