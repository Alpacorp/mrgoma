'use client';

import { FC, useState } from 'react';

import Image from 'next/image';

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

// Función para validar una URL
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  if (url === 'N/A' || url === 'null' || url === 'undefined') return false;

  try {
    // Verificar si es una URL relativa simple (comienza con /)
    if (url.startsWith('/')) return true;

    // Verificar si es una URL absoluta válida
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ProductImage: FC<ProductImageProps> = ({ product, priority = false }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return isValidUrl(product.imageSrc) ? product.imageSrc : DEFAULT_IMAGE_URL;
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
