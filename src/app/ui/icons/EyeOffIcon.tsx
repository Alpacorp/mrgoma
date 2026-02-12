import { IconProps } from '@/app/ui/interfaces/icons';
import React from 'react';

export const EyeOffIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`feather feather-eye-off ${className}`}
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a21.77 21.77 0 0 1 5.06-6.94" />
      <path d="M1 1l22 22" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 5c6 0 10 7 10 7a21.86 21.86 0 0 1-4.23 5.05" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};
