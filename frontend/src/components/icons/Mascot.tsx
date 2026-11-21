// ═══════════════════════════════════════════════════════════════
// Bolt Mascot — friendly hooded robot with antenna
// Flat style, thick dark outlines, 4-5 colors
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface MascotProps {
  size?: number;
  mood?: 'happy' | 'wink' | 'thinking' | 'wave';
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ size = 48, mood = 'happy', className = '' }) => {
  const reduced = useReducedMotion();

  const eyeR = mood === 'wink' ? (
    <line x1="62" y1="52" x2="70" y2="52" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
  ) : (
    <ellipse cx="66" cy="50" rx="4" ry="5" fill="#0B1220" />
  );

  return (
    <motion.div
      style={{ display: 'inline-flex', willChange: 'transform' }}
      className={className}
      animate={reduced ? {} : {
        y: [0, -2, 0, 2, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        aria-label="Bolt mascot"
      >
      {/* Antenna */}
      <motion.g
        animate={reduced ? {} : { rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ transformOrigin: '48px 18px' }}
      >
        <line x1="48" y1="18" x2="48" y2="8" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="6" r="4" fill="#D4F564" stroke="#0B1220" strokeWidth="2.5" />
      </motion.g>

      {/* Hood */}
      <path
        d="M24 38 C24 22, 72 22, 72 38 L72 32 C72 18, 24 18, 24 32 Z"
        fill="#1E3354"
        stroke="#0B1220"
        strokeWidth="2.5"
      />

      {/* Head / face */}
      <rect x="24" y="30" rx="16" ry="16" width="48" height="40" fill="#CFE3FA" stroke="#0B1220" strokeWidth="2.5" />

      {/* Hood overlay */}
      <path
        d="M24 38 C24 26, 72 26, 72 38"
        fill="#1E3354"
        stroke="#0B1220"
        strokeWidth="2.5"
      />

      {/* Eyes */}
      <ellipse cx="38" cy="50" rx="4" ry="5" fill="#0B1220" />
      {eyeR}

      {/* Eye blink animation */}
      <motion.rect
        x="28" y="45" width="40" height="12" rx="4" fill="#CFE3FA"
        initial={{ scaleY: 0 }}
        animate={reduced ? {} : { scaleY: [0, 0, 0, 1, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 4, times: [0, 0.3, 0.4, 0.5, 1] }}
        style={{ transformOrigin: '48px 50px' }}
      />

      {/* Mouth */}
      {mood === 'thinking' ? (
        <circle cx="52" cy="60" r="3" fill="none" stroke="#0B1220" strokeWidth="2" />
      ) : (
        <path d="M40 58 Q48 66, 56 58" fill="none" stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Body */}
      <rect x="32" y="70" rx="8" ry="8" width="32" height="20" fill="#1E3354" stroke="#0B1220" strokeWidth="2.5" />

      {/* Bolt emblem on chest */}
      <path d="M46 74 L50 74 L48 79 L52 79 L46 87 L47 82 L44 82 Z" fill="#D4F564" stroke="#0B1220" strokeWidth="1.5" />

      {/* Arms */}
      {mood === 'wave' ? (
        <>
          <motion.path
            d="M32 76 L22 68"
            stroke="#0B1220" strokeWidth="3" strokeLinecap="round"
            animate={reduced ? {} : { rotate: [0, -15, 0, 15, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: '32px 76px' }}
          />
          <path d="M64 76 L74 82" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M32 76 L22 82" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 76 L74 82" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      </svg>
    </motion.div>
  );
};
