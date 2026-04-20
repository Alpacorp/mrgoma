import Image from 'next/image';

import { mrGomaLogoLight } from '#public/assets/images/Logo';

export const DashboardFooter = () => {
  const copyrightYear = new Date().getFullYear();

  return (
    <footer className="bg-black relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/images/background-footer.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      </div>
      <div className="relative">
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Image
              alt="MrGoma Tires logo"
              src={mrGomaLogoLight || '/placeholder.svg'}
              className="h-8 w-auto"
              priority
            />
            <div className="space-y-1">
              <p className="text-white text-sm font-semibold leading-snug">
                Every Sale <span className="text-[#9dfb40]">Matters</span>. Every Customer{' '}
                <span className="text-[#9dfb40]">Remembers.</span>
              </p>
              <p className="text-gray-400 text-sm tracking-widest font-medium">
                Fast &bull; Value &bull; Trust
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600" />
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <p className="text-gray-400 text-xs text-center">
            <span className="text-[#9dfb40] font-semibold">MrGoma Tires®</span> — Internal
            Inventory System. All rights reserved {copyrightYear}.
          </p>
        </div>
      </div>
    </footer>
  );
};
