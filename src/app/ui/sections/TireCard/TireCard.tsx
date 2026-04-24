import { FC, SyntheticEvent } from 'react';

import Link from 'next/link';

import { useCart } from '@/app/context/CartContext';
import { BrandImage, FreeShippingBadge, ProductImage, StockBadge } from '@/app/ui/components';
import { buildTireSlug } from '@/app/utils/tireSlug';

interface TireCardProps {
  products: any;
}

const SPEC_KEYS = ['Remaining life', 'Tread depth', 'Patched', 'Run Flat'] as const;
type SpecKey = (typeof SPEC_KEYS)[number];

const SPEC_LABELS: Record<SpecKey, string> = {
  'Remaining life': 'Life',
  'Tread depth': 'Tread',
  Patched: 'Patched',
  'Run Flat': 'Run Flat',
};

function parseTireName(name: string): { size: string; displayName: string } {
  const parts = (name || '').split(' | ');
  if (parts.length >= 3)
    return { size: parts[parts.length - 1], displayName: parts.slice(2, -1).join(' ') || parts[1] };
  if (parts.length === 2) return { size: parts[1], displayName: parts[0] };
  return { size: '', displayName: name };
}

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const TireCard: FC<TireCardProps> = ({ products }: Readonly<{ products: any }>) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (event: SyntheticEvent, product: any) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <ul className="mt-3 space-y-6">
      {products.map((product: any) => {
        const productInCart = isInCart(product.id);
        const isSold =
          typeof product?.status === 'string' && product.status.trim().toLowerCase() === 'sold';
        const isNew = (product.condition || '').trim().toLowerCase() === 'new';
        const { size: tireSize, displayName } = parseTireName(product.name);

        const slug = product.id
          ? buildTireSlug(String(product.id), product.brand || '', tireSize)
          : '';
        const detailUrl = slug ? `/tires/${slug}` : '/tires';

        const specMap: Partial<Record<SpecKey, string>> = {};
        if (Array.isArray(product?.features)) {
          for (const f of product.features as Array<{ name: string; value: string }>) {
            if ((SPEC_KEYS as readonly string[]).includes(f.name))
              specMap[f.name as SpecKey] = f.value;
          }
        }

        const lifePct = parseInt((specMap['Remaining life'] || '').replace('%', ''), 10) || 0;
        const lifeColor =
          lifePct >= 70 ? 'bg-green-500' : lifePct >= 40 ? 'bg-amber-400' : 'bg-red-400';

        // Left border accent: green = new, amber = used
        const accentColor = isNew ? '#22c55e' : '#f59e0b';

        const condBadgeClass = isNew
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-amber-100 text-amber-700 border border-amber-300';
        const condLabel = isNew ? 'New' : 'Used';

        // Title: brand + model only — size shown separately as pill
        const titleText = [product.brand, displayName].filter(Boolean).join(' ');

        return (
          <li
            key={product.id}
            className="isolate bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
          >
            {/* ── Mobile: flex-col  /  Desktop: flex-row ── */}
            <div className="flex flex-col sm:flex-row">
              {/* ── Mobile top bar: condition badge (left) · stock badge (right) ── */}
              <div className="sm:hidden flex items-center justify-between px-4 py-2.5">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${condBadgeClass}`}
                >
                  {condLabel}
                </span>
                {!isSold && <StockBadge />}
              </div>

              {/* ── Image ── */}
              <Link
                href={detailUrl}
                className="block bg-gray-50 sm:w-52 md:w-64 sm:shrink-0"
                tabIndex={-1}
              >
                <div className="relative h-48 sm:h-full sm:min-h-[180px]">
                  <ProductImage product={product} />
                </div>
              </Link>

              {/* ── Content ── */}
              <div className="flex-1 min-w-0 flex flex-col px-4 pt-4 pb-5 sm:px-6 sm:py-5 gap-3 sm:gap-2">
                {/* Desktop: meta row + CTA */}
                <div className="hidden sm:flex items-start justify-between gap-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pt-0.5">
                    Single · Free Shipping
                  </span>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={e => handleAddToCart(e, product)}
                      disabled={productInCart}
                      className="flex items-center gap-2 pl-3 pr-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full hover:bg-green-700 disabled:bg-green-400 transition-colors whitespace-nowrap"
                    >
                      <CartIcon />
                      {productInCart ? '✓ In Cart' : 'Add to Cart'}
                    </button>
                    {!isSold && <StockBadge />}
                  </div>
                </div>

                {/* Condition badge (desktop only) + size pill (always) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${condBadgeClass}`}
                  >
                    {condLabel}
                  </span>
                  {tireSize && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-900 text-white text-xs font-bold tracking-wider">
                      {tireSize}
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link href={detailUrl} className="group/title">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-snug line-clamp-2 group-hover/title:text-green-700 transition-colors">
                    {titleText}
                  </h2>
                </Link>

                {/* Price + brand logo */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 leading-none">
                    ${product.price}
                  </span>
                  <FreeShippingBadge />
                  {product.brandId && (
                    <div className="hidden sm:flex h-8 overflow-hidden items-center opacity-80 ml-1">
                      <BrandImage product={{ brand: product.brand, brandId: product.brandId }} />
                    </div>
                  )}
                </div>

                {/* Mobile only: full-width CTA */}
                <div className="sm:hidden mt-1 mb-2">
                  <button
                    type="button"
                    onClick={e => handleAddToCart(e, product)}
                    disabled={productInCart}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-sm font-bold rounded-full hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    <CartIcon />
                    {productInCart ? '✓ IN CART' : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Spec strip ── */}
            <div className="grid grid-cols-4 divide-x divide-gray-200 border-t border-gray-200 bg-gray-100">
              {SPEC_KEYS.map(key => {
                const value = specMap[key] ?? '—';
                return (
                  <div key={key} className="flex flex-col gap-0.5 px-3 py-2.5">
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                      {SPEC_LABELS[key]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-800 leading-none">{value}</span>
                      {key === 'Remaining life' && lifePct > 0 && (
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden max-w-[48px]">
                          <div
                            className={`h-full rounded-full ${lifeColor}`}
                            style={{ width: `${lifePct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TireCard;
