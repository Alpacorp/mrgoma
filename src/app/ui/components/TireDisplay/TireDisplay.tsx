'use client';

import Image from 'next/image';
import React, { FC, useContext, useEffect, useRef } from 'react';

import shadow from '#public/assets/images/shadow.webp';
import tireImage from '#public/assets/images/tireSize.webp';
import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { ArrowsToRight } from '@/app/ui/icons';

const TireDisplay: FC = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  const { selectedFilters, setSelectedFilters } = useContext(SelectedFiltersContext);

  const allSelected = Object.values(selectedFilters).every(value => value);

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
  }, [selectedFilters]);

  useEffect(() => {
    setSelectedFilters({
      front: { width: '', sidewall: '', diameter: '' },
      rear: { width: '', sidewall: '', diameter: '' },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto overflow-hidden">
      <div ref={imageRef} className="relative w-full h-full">
        <Image
          className="w-full h-full object-cover"
          src={tireImage}
          width={200}
          height={200}
          alt="Tire size diagram"
          priority
        />
      </div>
      <div>
        <Image src={shadow} alt={'shadow'} className="absolute -bottom-[.4rem]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-2 px-4 py-1 bg-neutral-800 h-min w-min rounded-full shadow-xl m-auto">
        <ArrowsToRight className="w-10" />
        <div className="text-white text-center">
          <div
            className={`text-sm font-medium transition-all duration-500 ${
              allSelected ? 'text-green-400' : 'opacity-75'
            }`}
          >
            {selectedFilters.front.width || '000'}/{selectedFilters.front.sidewall || '00'}/
            {selectedFilters.front.diameter || '00'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireDisplay;
