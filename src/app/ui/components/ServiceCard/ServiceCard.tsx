'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ServiceCardProps } from '@/app/ui/components/ServiceCard/service';
import { ServiceIcon } from '@/app/ui/icons';

export const ServiceCard = ({
  title,
  description,
  backgroundImage,
  href,
  className = '',
}: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <div
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer
        transition-all duration-300 ease-in-out
        ${isHovered ? 'transform scale-105 shadow-2xl' : 'shadow-lg'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Service: ${title}`}
    >
      <div className="relative h-64 w-full">
        <Image
          src={backgroundImage || '/placeholder.svg'}
          alt={title}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center gap-4">
          <ServiceIcon />
          <h3 className="text-white text-xl font-bold">{title}</h3>
        </div>
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="bg-white bg-opacity-95 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-[#272727] text-sm font-medium">{description}</p>
            <div className="w-full h-1 bg-[#9dfb40] rounded-full mt-3" />
          </div>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

export default ServiceCard;
