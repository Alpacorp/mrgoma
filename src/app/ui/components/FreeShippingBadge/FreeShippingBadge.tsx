import React from 'react';

interface FreeShippingBadgeProps {
  className?: string;
  as?: React.ElementType;
  label?: string;
}

/**
 * Small green badge to indicate free shipping.
 * Accessible and reusable next to the product name or price.
 */
const FreeShippingBadge: React.FC<FreeShippingBadgeProps> = ({
  className = '',
  as: Tag = 'span',
  label = 'Free Shipping',
}) => {
  const classes =
    'inline-flex items-center rounded-full bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 px-2 py-0.5 text-xs font-medium ' +
    (className || '');

  return (
    <Tag className={classes} role="note" title={label}>
      {label}
    </Tag>
  );
};

export default FreeShippingBadge;
