'use client';

import { Search } from 'lucide-react';
import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
}

/**
 * FloatingButton component for the tire search
 * Appears at the bottom left of the screen
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2 z-50 sm:z-40 md:z-40 lg:z-40 xl:z-40"
      aria-label="Edit tire sizes"
      title="Edit tire sizes"
      style={{ position: 'fixed', display: 'flex' }}
    >
      <Search className="w-4 h-4" />
      <span className="text-sm font-medium">Edit Tires</span>
    </button>
  );
};
