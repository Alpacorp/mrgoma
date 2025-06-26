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
  const { selectedFilters, hasRearTires, handleFilterChange, removeRearTires, addRearTires } =
    useTireSearch();

  // Toggle the compact form visibility
  const toggleCompactForm = () => {
    setIsCompactFormOpen(!isCompactFormOpen);
  };

  return (
    <>
      {/* Floating button */}
      <FloatingButton onClick={toggleCompactForm} />

      {/* Compact form (conditionally rendered) */}
      {isCompactFormOpen && (
        <CompactForm
          selectedFilters={selectedFilters}
          hasRearTires={hasRearTires}
          onFilterChangeAction={handleFilterChange}
          onRemoveRearTiresAction={removeRearTires}
          onAddRearTiresAction={addRearTires}
          onCloseAction={toggleCompactForm}
        />
      )}
    </>
  );
};

export default CollapsibleSearchBar;
