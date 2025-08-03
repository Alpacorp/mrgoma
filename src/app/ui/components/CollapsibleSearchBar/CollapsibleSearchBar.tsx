'use client';

import React, { useState } from 'react';

import { CompactForm } from './components/CompactForm';
import { FloatingButton } from './components/FloatingButton';
import { useTireSearch } from './hooks/useTireSearch';

/**
 * CollapsibleSearchBar component
 * Provides a floating button that opens a compact form for tire selection
 */
const CollapsibleSearchBar: React.FC = () => {
  // State for the compact form visibility
  const [isCompactFormOpen, setIsCompactFormOpen] = useState(false);

  // Use the custom hook for tire search functionality
  const { selectedFilters, handleFilterChange, resetFilters } = useTireSearch();

  // Toggle the compact form visibility
  const toggleCompactForm = () => {
    setIsCompactFormOpen(!isCompactFormOpen);
  };

  return (
    <>
      {/* Floating button */}
      <FloatingButton action={toggleCompactForm} />

      {/* Compact form (conditionally rendered) */}
      {isCompactFormOpen && (
        <CompactForm
          selectedFilters={selectedFilters}
          onFilterChangeAction={handleFilterChange}
          onResetFiltersAction={resetFilters}
          onCloseAction={toggleCompactForm}
        />
      )}
    </>
  );
};

export default CollapsibleSearchBar;
