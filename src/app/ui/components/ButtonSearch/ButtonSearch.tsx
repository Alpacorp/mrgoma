import { FC } from 'react';

interface ButtonSearchProps {
  onClick?: () => void;
  disabled: '' | boolean | string;
  type?: 'submit' | 'reset' | 'button' | undefined;
}

const ButtonSearch: FC<ButtonSearchProps> = ({ onClick, disabled, type }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={!disabled}
      className={`w-full py-2 text-lg font-medium rounded-lg transition-colors ${
        disabled
          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      {disabled ? 'Search Tires' : 'Select all measurements'}
    </button>
  );
};

export default ButtonSearch;
