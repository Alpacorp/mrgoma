'use client';

import { CarFront, CarIcon as CarRear, ChevronDown, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface FilterOption {
  id: number;
  name: number;
}

const section: FilterOption[] = [
  { id: 1, name: 195 },
  { id: 2, name: 200 },
  { id: 3, name: 210 },
  { id: 4, name: 225 },
  { id: 5, name: 250 },
  { id: 6, name: 255 },
  { id: 7, name: 300 },
  { id: 8, name: 350 },
  { id: 9, name: 400 },
  { id: 10, name: 450 },
  { id: 11, name: 500 },
  { id: 12, name: 550 },
  { id: 13, name: 600 },
  { id: 14, name: 650 },
  { id: 15, name: 700 },
  { id: 16, name: 750 },
  { id: 17, name: 800 },
  { id: 18, name: 850 },
  { id: 19, name: 900 },
  { id: 20, name: 950 },
  { id: 21, name: 1000 },
  { id: 22, name: 1050 },
  { id: 23, name: 1100 },
  { id: 24, name: 1150 },
  { id: 25, name: 1200 },
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

const CollapsibleSearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    w: searchParams.get('w') || '',
    s: searchParams.get('s') || '',
    d: searchParams.get('d') || '',
    rw: searchParams.get('rw') || '',
    rs: searchParams.get('rs') || '',
    rd: searchParams.get('rd') || '',
  });
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        if (currentScrollY > 100) {
          setIsCollapsed(true);
          if (currentScrollY > 200) {
            setIsFullyCollapsed(true);
          } else {
            setIsFullyCollapsed(false);
          }
        } else {
          setIsCollapsed(false);
          setIsFullyCollapsed(false);
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

  const handleFilterChange = (value: string, type: string) => {
    const newFilters = {
      ...selectedFilters,
      [type]: value,
    };
    setSelectedFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/search-results?${params.toString()}`);
  };

  const removeRearTires = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rw');
    params.delete('rs');
    params.delete('rd');

    setSelectedFilters(prev => ({
      ...prev,
      rw: '',
      rs: '',
      rd: '',
    }));

    router.push(`/search-results?${params.toString()}`);
  };

  const hasRearTires = searchParams.has('rw');

  const renderDropdowns = (isRear: boolean) => {
    const prefix = isRear ? 'r' : '';
    const icon = isRear ? (
      <div>
        <CarRear className="w-6 h-6 text-gray-500" />
      </div>
    ) : (
      <div>
        <CarFront className="w-6 h-6 text-gray-500" />
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {icon}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
            {[
              { label: 'Width', options: section, type: `${prefix}w` },
              { label: 'Sidewall', options: aspectRatio, type: `${prefix}s` },
              { label: 'Diameter', options: diameter, type: `${prefix}d` },
            ].map(field => (
              <div key={field.type} className="relative">
                <select
                  value={selectedFilters[field.type as keyof typeof selectedFilters]}
                  onChange={e => handleFilterChange(e.target.value, field.type)}
                  className={`w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isCollapsed ? 'text-sm' : 'text-base'
                  }`}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(option => (
                    <option key={option.id} value={String(option.name)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {isRear && (
            <button
              onClick={removeRearTires}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Remove rear tire selection"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isFullyCollapsed) {
    return (
      <button
        onClick={() => setIsFullyCollapsed(false)}
        className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Expand search filters"
      >
        <ChevronDown className="w-6 h-6 text-gray-600" />
      </button>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`sticky top-0 z-50 w-full bg-white shadow-md transition-all duration-300 ease-in-out ${
        isCollapsed ? 'py-2' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {renderDropdowns(false)}
          {hasRearTires && renderDropdowns(true)}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSearchBar;
