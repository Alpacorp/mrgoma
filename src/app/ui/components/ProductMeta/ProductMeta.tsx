import React from 'react';

export type ProductMetaProps = {
  brand?: string | null;
  // Accept various casings/values and normalize to New/Used
  condition?: string | null; // expected values like 'New' | 'Used' | 'new' | 'used'
  className?: string;
};

function normalizeCondition(value?: string | null): 'New' | 'Used' | null {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (v === 'new' || v === 'nuevo') return 'New';
  if (v === 'used' || v === 'usado' || v === 'semi-nuevo' || v === 'semi nuevo') return 'Used';
  return null;
}

const ProductMeta: React.FC<ProductMetaProps> = ({ brand, condition, className }) => {
  const norm = normalizeCondition(condition);
  if (!brand && !norm) return null;
  return (
    <p className={["mt-1 text-sm text-gray-600 flex items-center gap-2", className].filter(Boolean).join(' ')}>
      {brand ? <span>{brand}</span> : null}
      {norm ? (
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset " +
            (norm === 'New'
              ? 'bg-green-50 text-green-700 ring-green-200'
              : 'bg-slate-50 text-slate-700 ring-slate-200')
          }
          aria-label={`Condition: ${norm}`}
        >
          <span aria-hidden>{norm}</span>
        </span>
      ) : null}
    </p>
  );
};

export default ProductMeta;
