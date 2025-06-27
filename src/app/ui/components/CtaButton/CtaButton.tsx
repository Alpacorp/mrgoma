import Link from 'next/link';
import { FC } from 'react';

interface CtaButtonProps {
  product: {
    name: string;
    id?: string | number;
  };
  text: string;
  style?: 'primary' | 'secondary' | 'tertiary' | 'default';
  urlParams?: Record<string, string | number>;
}

const CtaButton: FC<CtaButtonProps> = ({ product, text, style = 'default', urlParams = {} }) => {
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
    'relative flex items-center justify-center rounded-md border px-8 py-2 text-sm font-medium duration-150 w-full sm:w-auto';

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

  return (
    <Link href={url} className={buttonStyle} title={text}>
      {text}
      <span className="sr-only">, {product.name}</span>
    </Link>
  );
};

export default CtaButton;
