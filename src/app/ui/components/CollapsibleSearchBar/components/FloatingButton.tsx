'use client';

import React from 'react';

import { EditIcon } from '../../Icons/Icons';

interface FloatingButtonProps {
  action: () => void;
}

/**
 * FloatingButton component for the tire search
 * Appears at the bottom left of the screen
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({ action }) => {
  return (
    <button
      onClick={action}
      className="fixed bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 flex items-center gap-2 z-40 sm:z-40 md:z-40 lg:z-40 xl:z-40"
      aria-label="Edit tire sizes"
      title="Edit tire sizes"
      style={{ position: 'fixed', display: 'flex' }}
    >
      <EditIcon className="w-4 h-4" aria-hidden />
      <span className="text-sm font-medium">Edit Tire Sizes</span>
    </button>
  );
};
