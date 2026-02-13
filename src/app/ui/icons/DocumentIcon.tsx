import { IconProps } from '@/app/ui/interfaces/icons';
import React from 'react';

export const DocumentIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => {
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
      <path
        d="M10 8H22L26 12V28H10V8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M22 8V12H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M14 16H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 20H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 24H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};
