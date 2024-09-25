import { FC } from 'react';
import Link from 'next/link';

interface CtaButtonProps {
  product: {
    href: string;
    name: string;
  };
  text: string;
}

const CtaButton: FC<CtaButtonProps> = ({ product, text }) => {
  return (
    <Link
      href={product.href}
      className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
    >
      {text}
      <span className="sr-only">, {product.name}</span>
    </Link>
  );
};

export default CtaButton;
