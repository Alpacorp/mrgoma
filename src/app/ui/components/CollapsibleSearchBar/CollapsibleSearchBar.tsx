'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, FC } from 'react';

import { SelectDropdown } from '@/app/ui/components';

interface FilterOption {
  id: number;
  name: number;
}

const section: FilterOption[] = [
  { id: 1, name: 195 },
  { id: 2, name: 200 },
  { id: 3, name: 210 },
  { id: 4, name: 215 },
  { id: 5, name: 220 },
  { id: 6, name: 225 },
  { id: 7, name: 230 },
  { id: 8, name: 235 },
  { id: 9, name: 240 },
  { id: 10, name: 245 },
  { id: 11, name: 250 },
  { id: 12, name: 255 },
  { id: 13, name: 260 },
  { id: 14, name: 265 },
  { id: 15, name: 270 },
];

const aspectRatio: FilterOption[] = [
  { id: 1, name: 10 },
  { id: 2, name: 20 },
  { id: 3, name: 30 },
  { id: 4, name: 40 },
  { id: 5, name: 50 },
];

const diameter: FilterOption[] = [
  { id: 1, name: 8 },
  { id: 2, name: 10 },
  { id: 3, name: 12 },
  { id: 4, name: 14 },
  { id: 5, name: 16 },
];

const CollapsibleSearchBar: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    width: searchParams.get('width') || '',
    sidewall: searchParams.get('sidewall') || '',
    diameter: searchParams.get('diameter') || '',
  });
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        if (currentScrollY > 100) {
          setIsCollapsed(currentScrollY > lastScrollY.current);
        } else {
          setIsCollapsed(false);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });

      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleFilterChange = (value: string, type: 'width' | 'sidewall' | 'diameter') => {
    const newFilters = {
      ...selectedFilters,
      [type]: value,
    };
    setSelectedFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'py-2' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Width', options: section, type: 'width' },
            { label: 'Sidewall', options: aspectRatio, type: 'sidewall' },
            { label: 'Diameter', options: diameter, type: 'diameter' },
          ].map(field => (
            <div key={field.type} className="relative">
              <SelectDropdown
                selectedFilters={selectedFilters}
                handleFilterChange={handleFilterChange}
                isCollapsed={isCollapsed}
                field={field}
                key={field.type}
              />
            </div>
          ))}
        </div>

        <div
          className={`flex flex-wrap gap-2 mt-4 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
          }`}
        >
          {Object.entries(selectedFilters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                <button
                  type="button"
                  onClick={() => handleFilterChange('', key as keyof typeof selectedFilters)}
                  className="ml-1 inline-flex items-center rounded-full bg-green-50 p-1 text-green-700 hover:bg-green-100"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Remove {key} filter</span>
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSearchBar;
