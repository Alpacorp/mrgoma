'use client';

import { FC, useState } from 'react';

import Image from 'next/image';

import { isOptimisableImage } from '@/app/utils/imageHosts';

interface ProductImageProps {
  product: {
    imageAlt: string;
    imageSrc: string;
    brand: string;
  };
  /** Only set on the first 1-2 above-the-fold cards to help LCP. */
  priority?: boolean;
}

// URL de imagen por defecto cuando la URL original no es válida
const DEFAULT_IMAGE_URL = '/images/default-tire.png';

/**
 * A URL only counts as usable if `next/image` is configured for its host.
 *
 * It used to be enough for the URL to *parse*. `next/image` then threw during
 * render — "hostname is not configured under images" — which is not an error
 * this component can catch: `onError` fires when an image fails to load, and
 * nothing ever loaded. One eBay-hosted photo in the catalogue was 500ing its own
 * detail page and blanking every filtered view it appeared in.
 */

const ProductImage: FC<ProductImageProps> = ({ product, priority = false }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return isOptimisableImage(product.imageSrc) ? product.imageSrc : DEFAULT_IMAGE_URL;
  });

  const [imgError, setImgError] = useState(false);

  // Manejar errores de carga de imagen
  const handleImageError = () => {
    if (!imgError) {
      setImgSrc(DEFAULT_IMAGE_URL);
      setImgError(true);
    }
  };

  return (
    <div className="relative z-20 h-full w-full overflow-hidden rounded-lg">
      <Image
        className={`w-full object-contain object-center transition ease-in-out hover:scale-105 duration-300`}
        alt={product.imageAlt || product.brand || 'Tire image'}
        src={imgSrc}
        onError={handleImageError}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes="(min-width: 768px) 256px, (min-width: 640px) 208px, 100vw"
        width={500}
        height={500}
      />
    </div>
  );
};

export default ProductImage;
