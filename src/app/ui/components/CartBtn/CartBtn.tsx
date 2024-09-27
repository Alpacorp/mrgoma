import React, { FC } from 'react';

import { ShoppingCartIcon } from '@heroicons/react/24/solid';

interface CartBtnProps {
  message: string;
}


const CartBtn: FC<CartBtnProps> = ({ message }) => {
  return (
    <div className="mt-10 flex items-center">
      <button
        type="submit"
        className="flex w-full sm:max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
      >
        <ShoppingCartIcon
          className="mr-6 font-semibold"
          color="#ffffff"
          width={20}
          height={20}
        />
        {message}
      </button>
    </div>
  );
};

export default CartBtn;
