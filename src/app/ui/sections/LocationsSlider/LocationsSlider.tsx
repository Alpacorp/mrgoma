'use client';

import { useState, useCallback, useEffect } from 'react';

import { locationsData } from '#public/assets/images/locationsData';
import { LocationCard } from '@/app/ui/components';
import type { LocationData } from '@/app/ui/components/LocationCard/location-card';

interface LocationsSliderProps {
  locations?: LocationData[];
  className?: string;
  onLocationInteraction?: (action: 'map' | 'phone', data: string) => void;
}

export const LocationsSlider = ({
  locations = locationsData,
  className = '',
  onLocationInteraction,
}: LocationsSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  // Effect to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Check if we're on mobile (less than 768px width)
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCardsPerSlide(mobile ? 1 : 2);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLocationClick = useCallback(
    (location: LocationData) => {
      onLocationInteraction?.('map', location.address);
    },
    [onLocationInteraction]
  );

  const handlePhoneClick = useCallback(
    (phone: string) => {
      onLocationInteraction?.('phone', phone);
    },
    [onLocationInteraction]
  );

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const totalSlides = Math.ceil(locations.length / cardsPerSlide);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  // Basic touch swipe support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX !== null) {
      const delta = e.touches[0].clientX - touchStartX;
      setTouchDeltaX(delta);
    }
  };

  const handleTouchEnd = () => {
    const threshold = 50; // minimum px to trigger swipe
    if (touchDeltaX > threshold) {
      prevSlide();
    } else if (touchDeltaX < -threshold) {
      nextSlide();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  if (!locations.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No locations available.</p>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div
          className="relative group"
          role="region"
          aria-roledescription="carousel"
          aria-label="Locations carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden rounded-2xl ring-1 ring-gray-100 shadow-sm">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                const startIdx = slideIndex * cardsPerSlide;
                const locationsForSlide = locations.slice(startIdx, startIdx + cardsPerSlide);

                return (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-2 flex gap-4">
                    {locationsForSlide.map(location => (
                      <div key={location.id} className={isMobile ? 'w-full' : 'w-1/2'}>
                        <LocationCard
                          {...location}
                          onLocationClick={handleLocationClick}
                          onPhoneClick={handlePhoneClick}
                          className="mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gradient edge fades */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent hidden sm:block" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent hidden sm:block" />
          <button
            onClick={prevSlide}
            className="absolute cursor-pointer left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-[#9DFB40]/90 hover:bg-[#9DFB40] text-black p-3 sm:p-3.5 rounded-full transition-all duration-200 shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 border border-black/10 opacity-95 group-hover:opacity-100"
            aria-label="Previous location"
            title="Previous"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute cursor-pointer right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-[#9DFB40]/90 hover:bg-[#9DFB40] text-black p-3 sm:p-3.5 rounded-full transition-all duration-200 shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 border border-black/10 opacity-95 group-hover:opacity-100"
            aria-label="Next location"
            title="Next"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center gap-3 mt-8">
            <span className="text-sm text-gray-500" aria-live="polite">
              Slide <span className="font-semibold text-gray-700">{currentSlide + 1}</span> of{' '}
              <span className="font-semibold text-gray-700">{totalSlides}</span>
            </span>
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? 'bg-[#9dfb40] w-6'
                      : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSlider;
