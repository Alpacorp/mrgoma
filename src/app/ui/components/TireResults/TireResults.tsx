'use client';

import React, { FC } from 'react';

import { TireCard } from '@/app/ui/sections';

import { TirePosition } from '../TirePositionTabs/TirePositionTabs';

interface TireResultsProps {
  activeTab: TirePosition;
  products: any[];
  getTireSize: (position: TirePosition) => string;
}

const TireResults: FC<TireResultsProps> = ({ activeTab, products, getTireSize }) => {
  // For rear tires, we'll create a placeholder array of 15 items
  // In a real application, this would be replaced with actual rear tire data
  const rearTiresPlaceholder = Array.from({ length: 15 }, (_, index) => ({
    id: `rear-${index + 1}`,
    name: `Michelin PRIMACY A/S XL ${getTireSize('rear')}`,
    price: '$140',
    imageSrc: 'https://www.usedtires.online/LOTS/PEM/LOTP1346WH/images/DSC05548.JPG',
    imageAlt:
      'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
    condition: 'new',
    brand: 'Michelin',
    brandId: 2,
    features: [
      {
        name: 'Patched',
        value: 'No',
        icon: null,
      },
      {
        name: 'Remaining life',
        value: '91%',
        icon: null,
      },
      {
        name: 'Tread depth',
        value: '11.0/32',
        icon: null,
      },
      {
        name: 'Run Flat',
        value: 'No',
        icon: null,
      },
    ],
  }));

  // Use the appropriate data based on the active tab
  const displayProducts = activeTab === 'front' ? products : rearTiresPlaceholder;

  return (
    <div className="mx-auto">
      <TireCard products={displayProducts} />
    </div>
  );
};

export default TireResults;
