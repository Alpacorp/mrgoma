import { signOut } from 'next-auth/react';
import { FiltersMobile, DashboardTableContainer, TopFilters } from '@/app/ui/sections';
import { CollapsibleSearchBar, ResultsHeader } from '@/app/ui/components';

const Dashboard = () => {
  return (
    <div>
      <TopFilters redirectBasePath={'dashboard'} />

      <div className="w-full">
        <ResultsHeader />
        <FiltersMobile redirectBasePath={'dashboard'} />
        <div className="block lg:hidden">
          <CollapsibleSearchBar redirectBasePath={'dashboard'} />
        </div>
      </div>

      <div className="mt-16">
        <DashboardTableContainer />
      </div>

      <h1 className="text-center font-semibold">PAGINA PROTEGIDA POR SESIÓN</h1>
      <div className="flex justify-center mt-4">
        <button onClick={() => signOut()} className="bg-red-400 p-3 rounded-lg text-white">
          Close session
        </button>
      </div>
      <div className="mt-16">
        <p className="mb-8 text-white">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex nobis rerum suscipit aperiam
          id iste placeat, esse eveniet vel autem neque cupiditate deleniti fuga accusamus
          repellendus unde repudiandae hic obcaecati.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
