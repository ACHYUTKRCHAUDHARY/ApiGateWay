// ═══════════════════════════════════════════════════════════════
// Reusable UI Components — StatusPill, CopyButton, StarRating, 
// CountUp, Ribbon, Skeleton
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useToast } from './Toast';

// ── Status Pill ──
export const StatusPill: React.FC<{
  status: string;
  variant?: 'green' | 'red' | 'amber' | 'blue' | 'gray';
  locked?: boolean;
}> = ({ status, variant = 'gray', locked = false }) => {
  const { addToast } = useToast();
  const reduced = useReducedMotion();
  const [shaking, setShaking] = useState(false);

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    green:  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    red:    { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    amber:  { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    blue:   { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    gray:   { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  };
  const c = colors[variant] || colors.gray;

  const handleClick = () => {
    if (!locked) return;
    setShaking(true);
    addToast('This endpoint is locked. Contact your admin to re-activate.', 'error');
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <motion.span
      onClick={handleClick}
      animate={shaking && !reduced ? { x: [0, -4, 4, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${locked ? 'cursor-pointer' : ''}`}
      style={{ background: c.bg, color: c.text, borderColor: c.border, fontFamily: 'var(--font-body)' }}
    >
      {status}
    </motion.span>
  );
};

// ── Copy Button ──
export const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border transition-colors ${className}`}
      style={{
        background: copied ? '#ECFDF5' : 'var(--white)',
        borderColor: copied ? '#A7F3D0' : 'var(--border)',
        color: copied ? '#059669' : 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
      }}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
          Copy
        </>
      )}
    </motion.button>
  );
};

// ── Star Rating ──
export const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => {
  const reduced = useReducedMotion();
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.svg
          key={i}
          width="14" height="14" viewBox="0 0 24 24"
          initial={reduced ? {} : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 500, damping: 15 }}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"
            fill={i < rating ? '#F5B301' : '#E5E7EB'}
            stroke={i < rating ? '#D97706' : '#D1D5DB'}
            strokeWidth="1"
          />
        </motion.svg>
      ))}
    </div>
  );
};

// ── Count Up ──
export const CountUp: React.FC<{
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}> = ({ end, duration = 1.2, prefix = '', suffix = '', decimals = 0, className = '' }) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setValue(end); return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView, reduced]);

  return (
    <span ref={ref} className={`font-mono ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN')}{suffix}
    </span>
  );
};

// ── Ribbon (diagonal corner) ──
export const Ribbon: React.FC<{
  label: string;
  color?: string;
}> = ({ label, color = '#F97316' }) => (
  <div
    className="absolute -top-[1px] -right-[1px] w-24 h-24 overflow-hidden pointer-events-none rounded-tr-[16px]"
    aria-hidden="true"
  >
    <div
      className="absolute top-[14px] -right-[22px] w-[120px] text-center text-[9px] font-bold uppercase tracking-widest py-1 rotate-45 group"
      style={{ background: color, color: '#FFFFFF', fontFamily: 'var(--font-body)' }}
    >
      {/* Shine sweep on hover */}
      <span className="relative z-10">{label}</span>
      <span
        className="absolute inset-0 -left-full opacity-0 group-hover:left-[200%] group-hover:opacity-30 transition-all duration-700"
        style={{ background: 'linear-gradient(90deg, transparent, white, transparent)', width: '60%' }}
      />
    </div>
  </div>
);

// ── Skeleton Loader ──
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);
