import { IconProps } from '@/app/ui/interfaces/icons';
import React from 'react';

export const LockIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="7"
        y="16"
        width="22"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V12C12 8.68629 14.6863 6 18 6C21.3137 6 24 8.68629 24 12V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 22V25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};
