import { FC, useContext } from 'react';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

// Custom Bars3Icon component to replace the one from heroicons
const Bars3Icon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const HamburgerMenu: FC = () => {
  const { setShowMenu } = useContext(ShowMenuContext);

  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default HamburgerMenu;
