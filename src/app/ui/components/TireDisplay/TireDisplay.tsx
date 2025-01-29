import Image from 'next/image';
import React, { FC, useContext, useEffect, useRef } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';

interface TireDisplayProps {
  width: string;
  sidewall: string;
  diameter: string;
}

const TireDisplay: FC<TireDisplayProps> = ({ width, sidewall, diameter }) => {
  const imageRef = useRef<HTMLDivElement>(null);

  const { selectedFilters } = useContext(SelectedFiltersContext);

  const allSelected = width && sidewall && diameter;

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.style.transition = 'transform 0.5s ease-in-out';
      imageRef.current.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.style.transition = 'none';
          imageRef.current.style.transform = 'rotate(0deg)';
        }
      }, 500);
    }
  }, [width, sidewall, diameter]);

  return (
    <div className="relative w-48 h-48 mx-auto bg-black rounded-full p-4 overflow-hidden">
      <div ref={imageRef} className="relative w-full h-full">
        <Image
          className="w-full h-full object-cover"
          src="/assets/images/tireSize.png"
          width={200}
          height={200}
          alt="Tire size diagram"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="text-white text-center">
          <div
            className={`text-2xl font-bold transition-all duration-500 ${
              allSelected ? 'scale-110 text-green-400' : 'opacity-75'
            }`}
          >
            {selectedFilters.width || '???'}/{selectedFilters.sidewall || '??'}/
            {selectedFilters.diameter || '??'}
          </div>
          <div className="text-xs mt-2 opacity-75">
            {allSelected ? 'Size Complete!' : 'Select all measurements'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireDisplay;
