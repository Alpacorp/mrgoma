import { FC, ReactNode, useContext } from 'react';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

/**
 * `HamburgerMenu` is a React functional component that renders a hamburger menu icon.
 * When clicked, it sets the `showMenu` state to true, which typically triggers the display
 * of a mobile navigation menu.
 *
 * @returns {ReactNode} The rendered hamburger menu button.
 */
const HamburgerMenu: FC = (): ReactNode => {
  const { setShowMenu } = useContext(ShowMenuContext);

  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default HamburgerMenu;
