'use client';
import { useContext, useState } from 'react';

import { useSession, signOut } from 'next-auth/react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import AiChat from '@/app/ui/components/AiChat/AiChat';
import { TireSelector } from '@/app/ui/components/CollapsibleSearchBar/components/TireSelector';
import { useTireSearch } from '@/app/ui/components/CollapsibleSearchBar/hooks/useTireSearch';
import { AdjustmentsHorizontalIcon } from '@/app/ui/components/Icons/Icons';
import { FiltersMobile, TopFilters } from '@/app/ui/sections';
import DashboardCartModal from '@/app/ui/sections/DashboardCartModal/DashboardCartModal';
import DashboardTableContainer from '@/app/ui/sections/DashboardTableContainer/DashboardTableContainer';

const Dashboard = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Administrator';
  const { setShowFilter } = useContext(ShowFilterContext);
  const { selectedFilters: mobileTireFilters, handleFilterChange: handleMobileTireChange } =
    useTireSearch('dashboard');
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="mb-3 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-base font-semibold text-gray-900">Welcome, {userName}</h1>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-xs cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Sign Out
        </button>
      </header>

      {/* Filters Section */}
      <section className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Accordion header */}
          <button
            type="button"
            onClick={() => setFiltersOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-green-500 rounded-full" />
              <h2 className="text-base font-semibold text-gray-900">Search</h2>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Accordion body */}
          <div className={`grid transition-all duration-300 ease-in-out ${filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-3 pb-3 border-t border-gray-100">
                <TopFilters
                  redirectBasePath={'dashboard'}
                  apiBasePath={'/api/dashboard'}
                  showPriceFilter={false}
                  showStoreFilter={true}
                />
                <div className="lg:hidden border-t border-gray-50 pt-3 space-y-3">
                  <TireSelector
                    selectedFilters={mobileTireFilters}
                    onFilterChangeAction={handleMobileTireChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilter(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
                    aria-label="Show filters"
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                  <FiltersMobile
                    redirectBasePath={'dashboard'}
                    apiBasePath={'/api/dashboard'}
                    showPriceFilter={false}
                    showStoreFilter={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-1 bg-green-500 rounded-full"></div>
            <h2 className="text-base font-semibold text-gray-900">Inventory Data</h2>
          </div>
          <DashboardTableContainer />
        </div>
      </section>

      <AiChat />
      <DashboardCartModal />
    </div>
  );
};

export default Dashboard;
