import React from 'react';

import { IconProps } from '@/app/ui/interfaces/icons';

export const UserIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="18"
        cy="12"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 28C6 22.4772 11.3726 18 18 18C24.6274 18 30 22.4772 30 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
