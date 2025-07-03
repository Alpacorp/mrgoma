import Link from 'next/link';
import { FC, MouseEvent } from 'react';

interface CtaButtonProps {
  product: {
    name: string;
    id?: string | number;
  };
  text: string;
  style?: 'primary' | 'secondary' | 'tertiary' | 'default';
  urlParams?: Record<string, string | number>;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, product: any) => void;
  disabled?: boolean;
  isLink?: boolean;
}

const CtaButton: FC<CtaButtonProps> = ({
  product,
  text,
  style = 'default',
  urlParams = {},
  onClick,
  disabled = false,
  isLink = true,
}) => {
  // Construct URL with parameters
  let url = '/detail';
  const queryParams = new URLSearchParams();

  // Add product ID if available
  if (product.id) {
    queryParams.append('productId', product.id.toString());
  }

  // Add any additional URL parameters
  Object.entries(urlParams).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });

  // Append query parameters to URL if any exist
  const queryString = queryParams.toString();
  if (queryString) {
    url = `${url}?${queryString}`;
  }

  // Define styles based on the style prop
  let buttonStyle =
    'relative cursor-pointer flex items-center justify-center rounded-md border px-8 py-2 text-sm font-medium duration-150 w-full sm:w-auto';

  switch (style) {
    case 'primary':
      buttonStyle += ' !border-green-600 text-green-700 hover:bg-green-500 hover:text-white';
      break;
    case 'secondary':
      buttonStyle += ' !border-blue-600 text-blue-700 hover:bg-blue-500 hover:text-white';
      break;
    case 'tertiary':
      buttonStyle += ' !border-yellow-600 text-yellow-700 hover:bg-yellow-500 hover:text-white';
      break;
    default:
      buttonStyle += ' !border-green-600 text-green-700 hover:bg-green-500 hover:text-white';
      break;
  }

  // Add disabled styles if the button is disabled
  if (disabled) {
    buttonStyle +=
      ' opacity-50 !cursor-not-allowed !border-gray-400 !text-gray-500 hover:!bg-transparent hover:!text-gray-500';
  }

  // Handle click event
  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      onClick(e, product);
    }
  };

  // Render as a button if onClick is provided or isLink is false
  if (onClick || !isLink) {
    return (
      <button
        className={buttonStyle}
        title={text}
        onClick={handleClick}
        disabled={disabled}
        type="button"
      >
        {text}
        <span className="sr-only">, {product.name}</span>
      </button>
    );
  }

  // Otherwise render as a link
  return (
    <Link
      href={url}
      className={buttonStyle}
      title={text}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      {text}
      <span className="sr-only">, {product.name}</span>
    </Link>
  );
};

export default CtaButton;
