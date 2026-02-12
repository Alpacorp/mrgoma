import { IconProps } from '@/app/ui/interfaces/icons';
import React from 'react';

export const DollyIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M14 6L18 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      <path d="M18 26L32 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      <path d="M32 30H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      <rect x="24" y="12" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="3" />

      <circle cx="18" cy="30" r="4" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
};
