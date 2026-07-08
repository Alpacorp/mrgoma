'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

import RangeSlider from '@/app/ui/components/RangeSlider/RangeSlider';
import { filtersItems } from '@/app/ui/sections/FiltersMobile/FiltersItems';

/** Extra (non-size) filters the home search can forward to /tires. `null` price
 *  bounds mean "not constrained" so they are omitted from the URL. */
export interface HomeExtraFilters {
  brands: string[];
  condition: string[];
  minPrice: number | null;
  maxPrice: number | null;
}

interface HomeMoreFiltersProps {
  /** Currently applied filters (drives the count badge + seeds the draft). */
  value: HomeExtraFilters;
  /** Stage the draft filters (the main Search button runs the actual search). */
  onApply: (filters: HomeExtraFilters) => void;
}

const conditionOptions =
  filtersItems.find(s => s.id === 'condition')?.options ?? [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
  ];

const SlidersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 6h11M19 6h1M4 12h1M9 12h11M4 18h7M15 18h5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="6" r="2.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="7" cy="12" r="2.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="13" cy="18" r="2.2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * "More filters" entry point for the home hero. The size selector stays the
 * primary CTA; this is a secondary, progressively-disclosed panel for Brand /
 * Condition / Price.
 *
 * The panel is a native Popover (`popover="auto"`), so it renders in the top
 * layer — it sits above the AI chat without portals or z-index hacks — and gets
 * light-dismiss + Escape for free. CSS anchor positioning is not Baseline yet,
 * so the panel is placed with a small JS helper (desktop dropdown) and styled as
 * a bottom sheet on mobile.
 */
const HomeMoreFilters: FC<HomeMoreFiltersProps> = ({ value, onApply }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const loadedRef = useRef(false);

  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [bounds, setBounds] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<string[]>(value.brands);
  const [condition, setCondition] = useState<string[]>(value.condition);
  const [price, setPrice] = useState<[number, number] | null>(null);
  const [brandQuery, setBrandQuery] = useState('');

  const activeCount =
    value.brands.length +
    value.condition.length +
    (value.minPrice !== null || value.maxPrice !== null ? 1 : 0);

  const loadData = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([fetch('/api/brands'), fetch('/api/ranges')]);
      if (bRes.ok) setAllBrands((await bRes.json()) as string[]);
      if (rRes.ok) {
        const d = (await rRes.json()) as { minPrice: number; maxPrice: number };
        setBounds([d.minPrice, d.maxPrice]);
      }
    } catch {
      /* keep the panel usable even if options fail to load */
    } finally {
      setLoading(false);
    }
  }, []);

  // Seed the price range once bounds arrive (or re-seed on open below).
  useEffect(() => {
    if (bounds && price === null) {
      setPrice([value.minPrice ?? bounds[0], value.maxPrice ?? bounds[1]]);
    }
  }, [bounds, price, value.minPrice, value.maxPrice]);

  // Desktop: centered modal via the popover's own top-layer UA centering
  // (inset:0 + margin:auto). Mobile: a bottom sheet. No per-pixel anchoring, so
  // it can never run off-screen.
  const positionPanel = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (window.matchMedia('(max-width: 767px)').matches) {
      Object.assign(panel.style, {
        top: 'auto',
        bottom: '0',
        left: '0',
        right: '0',
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        borderRadius: '1rem 1rem 0 0',
      });
    } else {
      // Clear any mobile inline overrides so the className width/height and the
      // UA centering take over.
      panel.style.cssText = '';
    }
  }, []);

  // Seed the draft + lazy-load options when the popover opens, and re-evaluate
  // the layout (modal vs bottom sheet) on resize while open.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState !== 'open') return;
      setBrands(value.brands);
      setCondition(value.condition);
      setBrandQuery('');
      if (bounds) setPrice([value.minPrice ?? bounds[0], value.maxPrice ?? bounds[1]]);
      loadData();
      positionPanel();
      window.addEventListener('resize', positionPanel);
    };
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === 'closed') {
        window.removeEventListener('resize', positionPanel);
      }
    };

    panel.addEventListener('beforetoggle', onBeforeToggle);
    panel.addEventListener('toggle', onToggle);
    return () => {
      panel.removeEventListener('beforetoggle', onBeforeToggle);
      panel.removeEventListener('toggle', onToggle);
      window.removeEventListener('resize', positionPanel);
    };
  }, [value, bounds, loadData, positionPanel]);

  const toggleValue = (list: string[], v: string) =>
    list.includes(v) ? list.filter(x => x !== v) : [...list, v];

  const filteredBrands = allBrands.filter(b =>
    b.toLowerCase().includes(brandQuery.trim().toLowerCase())
  );

  const apply = () => {
    const touchedPrice =
      bounds && price ? price[0] !== bounds[0] || price[1] !== bounds[1] : false;
    onApply({
      brands,
      condition,
      minPrice: touchedPrice && price ? price[0] : null,
      maxPrice: touchedPrice && price ? price[1] : null,
    });
    panelRef.current?.hidePopover();
  };

  const clear = () => {
    setBrands([]);
    setCondition([]);
    setBrandQuery('');
    if (bounds) setPrice([bounds[0], bounds[1]]);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => panelRef.current?.showPopover()}
        aria-haspopup="dialog"
        data-track="open_home_more_filters"
        data-track-category="home_search"
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
      >
        <SlidersIcon className="h-4 w-4 text-gray-500" />
        More filters
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <div
        ref={panelRef}
        popover="auto"
        aria-label="More filters"
        className="mg-popover max-h-[85dvh] w-[28rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-black/10"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">More filters</h2>
          <button
            type="button"
            onClick={() => panelRef.current?.hidePopover()}
            aria-label="Close filters"
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-4 py-4">
          {/* Condition */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-900">Condition</legend>
            <div className="flex gap-4">
              {conditionOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={condition.includes(opt.value)}
                    onChange={() => setCondition(prev => toggleValue(prev, opt.value))}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Price */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-900">Price</legend>
            {loading && !bounds ? (
              <p className="text-sm text-gray-400">Loading price range…</p>
            ) : bounds && price ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${price[0]}</span>
                  <span>${price[1]}</span>
                </div>
                <RangeSlider
                  min={bounds[0]}
                  max={bounds[1]}
                  step={1}
                  value={price}
                  onChange={setPrice}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-400">Price range unavailable.</p>
            )}
          </fieldset>

          {/* Brands */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-900">Brands</legend>
            <input
              type="search"
              value={brandQuery}
              onChange={e => setBrandQuery(e.target.value)}
              placeholder="Search brands…"
              aria-label="Search brands"
              style={{ fontSize: '16px' }}
              className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <div className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
              {loading && allBrands.length === 0 ? (
                <p className="text-sm text-gray-400">Loading brands…</p>
              ) : filteredBrands.length === 0 ? (
                <p className="text-sm text-gray-400">No brands match “{brandQuery}”.</p>
              ) : (
                filteredBrands.map((brand, idx) => (
                  <label
                    key={brand}
                    htmlFor={`home-brand-${idx}`}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <input
                      id={`home-brand-${idx}`}
                      type="checkbox"
                      value={brand}
                      checked={brands.includes(brand)}
                      onChange={() => setBrands(prev => toggleValue(prev, brand))}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                    />
                    {brand.toUpperCase()}
                  </label>
                ))
              )}
            </div>
          </fieldset>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
          <button
            type="button"
            onClick={clear}
            data-track="clear_home_filters"
            data-track-category="home_search"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={apply}
            data-track="apply_home_filters"
            data-track-category="home_search"
            data-track-value={brands.length + condition.length}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default HomeMoreFilters;
