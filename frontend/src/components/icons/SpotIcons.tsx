// ═══════════════════════════════════════════════════════════════
// Spot Icons — flat cartoon SVGs for KPI cards
// coin, shield, flame, bolt
// ═══════════════════════════════════════════════════════════════
import React from 'react';

interface SpotProps {
  size?: number;
  className?: string;
}

export const CoinIcon: React.FC<SpotProps> = ({ size = 40, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <circle cx="24" cy="26" r="18" fill="#F5B301" stroke="#0B1220" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="18" fill="#F5B301" stroke="#0B1220" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="12" fill="none" stroke="#0B1220" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="24" y="29" textAnchor="middle" fill="#0B1220" fontFamily="'Montserrat',sans-serif" fontWeight="800" fontSize="14">₹</text>
  </svg>
);

export const ShieldIcon: React.FC<SpotProps> = ({ size = 40, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path d="M24 4 L40 12 L40 26 C40 36, 30 42, 24 44 C18 42, 8 36, 8 26 L8 12 Z"
      fill="#34D399" stroke="#0B1220" strokeWidth="2.5" />
    <path d="M18 24 L22 28 L30 18" stroke="#0B1220" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const FlameIcon: React.FC<SpotProps> = ({ size = 40, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path d="M24 4 C24 4, 36 16, 36 28 C36 36, 30 44, 24 44 C18 44, 12 36, 12 28 C12 16, 24 4, 24 4Z"
      fill="#F97316" stroke="#0B1220" strokeWidth="2.5" />
    <path d="M24 22 C24 22, 30 28, 30 32 C30 36, 27 40, 24 40 C21 40, 18 36, 18 32 C18 28, 24 22, 24 22Z"
      fill="#F5B301" stroke="#0B1220" strokeWidth="2" />
  </svg>
);

export const BoltIcon: React.FC<SpotProps> = ({ size = 40, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path d="M28 4 L14 26 L22 26 L18 44 L36 20 L27 20 Z"
      fill="#D4F564" stroke="#0B1220" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

// Hexagon step icon for the onboarding flow
export const HexagonStep: React.FC<SpotProps & { filled?: boolean; number?: number }> = ({
  size = 48, className, filled = false, number,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path
      d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z"
      fill={filled ? '#D4F564' : '#E9EDF5'}
      stroke="#0B1220"
      strokeWidth="2.5"
    />
    {number != null && (
      <text x="24" y="28" textAnchor="middle" fill="#0B1220" fontFamily="'Montserrat',sans-serif" fontWeight="700" fontSize="16">
        {number}
      </text>
    )}
  </svg>
);
