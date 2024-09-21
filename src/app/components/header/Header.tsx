"use client"
import React, {useState} from 'react';
import Link from 'next/link';
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Services', href: '#' },
    { name: 'About us', href: '#' },
    { name: 'Locations', href: '#' },
    { name: 'Contact us', href: '#' },
  ]



/* <img className='w-40' src="images/logo-mrgoma.webp" alt="mr gomma logo" /> */


function Header() {

 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="bg-black">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <Link href="#" className="-m-1.5 p-1.5">
          <span className="sr-only">Mr gomma</span>
          <img
            alt=""
            src="images/logo-mrgoma.webp"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 ">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden border-4"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white px-6 py-6 sm:w-sm sm:ring-1 sm:ring-gray-900/10 shadow-xl">
          <div className="flex items-center justify-between">
            <Link href="#" className="-m-1.5 p-1.5 bg-black rounded">
              <span className="sr-only">Mr gomma</span>
              <img
                alt="mr gomma logo"
                src="images/logo-mrgoma.webp"
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
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
    </header>
  );
}

export default Header;
