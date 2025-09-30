import React from 'react';

interface PromoBarProps {
  className?: string;
}

/**
 * Global promotional bar displayed at the top of the site, above the Header.
 * Text is kept in English as requested.
 */
const PromoBar: React.FC<PromoBarProps> = ({ className }) => {
  return (
    <div
      role="note"
      aria-label="Promotional message"
      className={
        'w-full bg-green-600 text-white text-sm sm:text-[0.95rem] leading-6 ' +
        'px-3 sm:px-4 py-2 shadow-sm ' +
        'flex items-center justify-center text-center ' +
        'print:hidden ' +
        (className ? ` ${className}` : '')
      }
    >
      <span aria-hidden="true" className="mr-2">🎉</span>
      <span className="font-medium">
        Free Shipping on All Tires — No Surprises at Checkout
      </span>
    </div>
  );
};

export default PromoBar;
