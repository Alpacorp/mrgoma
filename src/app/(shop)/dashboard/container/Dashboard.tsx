'use client';
import { useSession, signOut } from 'next-auth/react';

import { CollapsibleSearchBar, ResultsHeader } from '@/app/ui/components';
import AiChat from '@/app/ui/components/AiChat/AiChat';
import { FiltersMobile, TopFilters } from '@/app/ui/sections';
import DashboardTableContainer from '@/app/ui/sections/DashboardTableContainer/DashboardTableContainer';

const Dashboard = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Administrator';

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time stock management and visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Active Session
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium text-sm shadow-sm cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
          </div>
          <TopFilters redirectBasePath={'dashboard'} apiBasePath={'/api/dashboard'} />

          <div className="lg:hidden mt-2 border-t border-gray-50 pt-6">
            <ResultsHeader showTitle={false} showCount={false} showSort={false} />
            <FiltersMobile redirectBasePath={'dashboard'} apiBasePath={'/api/dashboard'} />
            <div className="mt-4">
              <CollapsibleSearchBar redirectBasePath={'dashboard'} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Inventory Data</h2>
          </div>
          <DashboardTableContainer />
        </div>
      </section>

      {/* Dashboard Footer */}
      <footer className="mt-12 text-center pb-8">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Mr. Goma Tires - Internal Inventory System. Protected Page.
        </p>
      </footer>

      <AiChat />
    </div>
  );
};

export default Dashboard;
