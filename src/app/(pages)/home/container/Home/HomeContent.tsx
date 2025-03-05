import { FC } from 'react';

import { SearchContainer } from '@/app/ui/components';

const HomeContent: FC = () => {
  return (
    <main className="bg-white">
      <div>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section aria-labelledby="products-heading">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3 mt-20">
              <div className="lg:col-span-3">
                <div className="sticky top-0 z-40 bg-gray-100 p-2 rounded-lg shadow-lg">
                  <SearchContainer />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </main>
  );
};

export default HomeContent;
