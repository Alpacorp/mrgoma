import { FC, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { menuItems } from '@/app/ui/sections/Header/MenuItems';

import { mrGomaLogo } from '#public/assets/images/Logo';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

const MenuMobile: FC = () => {
  const { showMenu, setShowMenu } = useContext(ShowMenuContext);

  return (
    <Dialog
      open={showMenu}
      onClose={() => setShowMenu(false)}
      className="lg:hidden border-4"
    >
      <div className="fixed inset-0 z-10" />
      <DialogPanel className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white px-6 py-6 sm:w-sm sm:ring-1 sm:ring-gray-900/10 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="#" className="-m-1.5 p-1.5 bg-black rounded">
            <Image
              alt="Mr. Goma Tires logo"
              title="Go to the home page"
              aria-label="Go to the home page"
              src={mrGomaLogo}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setShowMenu(false)}
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
          >
            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default MenuMobile;
