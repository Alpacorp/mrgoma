import { FC } from 'react';

interface ButtonSearchProps {
  onClick?: () => void;
  disabled: '' | boolean | string;
  /**
   * Defaults to `button`.
   *
   * It was optional and unset, and React omits an attribute whose value is
   * `undefined` — which leaves a bare `<button>`, and HTML defaults *that* to
   * `submit`. Harmless where it renders today, and a form submitted by the wrong
   * control the first time one of these is placed inside a `<form>`.
   */
  type?: 'submit' | 'reset' | 'button';
}

const ButtonSearch: FC<ButtonSearchProps> = ({ onClick, disabled, type = 'button' }) => {
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
