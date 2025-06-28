import React from 'react';

interface XMarkIconProps {
  className?: string;
}

/**
 * XMark (close) icon component
 * Custom implementation to replace the one from heroicons
 */
export const XMarkIcon: React.FC<XMarkIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
