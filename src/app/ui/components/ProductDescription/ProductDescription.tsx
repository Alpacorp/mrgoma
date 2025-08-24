'use client';

import React, { FC, useMemo, useState } from 'react';

interface ProductDescriptionProps {
  description: string;
}

const MAX_PREVIEW_CHARS = 260;

const ProductDescription: FC<ProductDescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  const normalized = useMemo(() => (description || '').trim(), [description]);
  const isEmpty = normalized.length === 0;

  const needsTruncate = normalized.length > MAX_PREVIEW_CHARS;
  const preview = needsTruncate ? normalized.slice(0, MAX_PREVIEW_CHARS).trimEnd() + '…' : normalized;

  return (
    <section aria-labelledby="product-description-title" className="relative">
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600" aria-hidden="true">
            <span>📝</span>
          </div>
          <h3 id="product-description-title" className="text-base font-semibold text-gray-900">
            Description
          </h3>
        </div>

        {isEmpty ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            No additional description provided for this item.
          </div>
        ) : (
          <div>
            <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
              {expanded ? normalized : preview}
            </p>
            {needsTruncate && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setExpanded(prev => !prev)}
                  aria-expanded={expanded}
                  className="inline-flex items-center gap-1 rounded-md border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDescription;
