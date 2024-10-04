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
      href="/detail"
      className="relative flex items-center justify-center rounded-md border border-transparent !border-green-600 text-green-700 px-8 py-2 text-sm font-medium hover:bg-green-500 hover:text-white duration-150"
      title={text}
    >
      {text}
      <span className="sr-only">, {product.name}</span>
    </Link>
  );
};

export default CtaButton;
