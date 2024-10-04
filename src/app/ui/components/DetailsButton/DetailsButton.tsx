import { FC, ComponentProps } from 'react';

type DetailsButtonProps = ComponentProps<'button'>;

const DetailsButton: FC<DetailsButtonProps> = ({ onClick, children }) => {
  return (
    <button
      type="button"
      className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 duration-100"
      onClick={onClick}
      title={children as string}
    >
      {children}
    </button>
  );
};

export default DetailsButton;
