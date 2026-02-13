import { IconProps } from '@/app/ui/interfaces/icons';
import React from 'react';

export const WarningIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 2L1 22H23L12 2Z" fill="currentColor" />

      <rect x="11" y="8" width="2" height="7" rx="1" fill="#fff" />
      <circle cx="12" cy="18" r="1.2" fill="#fff" />
    </svg>
  );
};
