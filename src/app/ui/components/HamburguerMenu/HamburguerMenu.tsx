import { Bars3Icon } from '@heroicons/react/24/outline';
import { FC, useContext } from 'react';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

const HamburguerMenu: FC = () => {
  const { setShowMenu } = useContext(ShowMenuContext);

  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
      >
        <Bars3Icon aria-hidden="true" className="h-6 w-6" />
      </button>
    </div>
  );
};

export default HamburguerMenu;
