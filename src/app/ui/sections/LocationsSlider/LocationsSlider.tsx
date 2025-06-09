'use client';

import { useState, useCallback } from 'react';

import { LocationCard } from '@/app/ui/components';
import type { LocationData } from '@/app/ui/components/LocationCard/location-card';
import { locationsData } from '@/app/ui/sections/LocationsSlider/locationsData';

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

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % locations.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + locations.length) % locations.length);
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
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {locations.map(location => (
                <div key={location.id} className="w-full flex-shrink-0 px-2">
                  <LocationCard
                    {...location}
                    onLocationClick={handleLocationClick}
                    onPhoneClick={handlePhoneClick}
                    className="mx-auto max-w-lg"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={prevSlide}
            className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 bg-black opacity-50 hover:opacity-70 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Previous location"
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
            className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 bg-black opacity-50 hover:opacity-70 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Next location"
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
          <div className="flex justify-center gap-2 mt-8">
            {locations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? 'bg-[#9dfb40] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to location ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSlider;
