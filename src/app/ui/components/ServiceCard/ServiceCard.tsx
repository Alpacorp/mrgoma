'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ServiceCardProps } from '@/app/ui/components/ServiceCard/service';
import { ServiceIcon } from '@/app/ui/components/ServiceCard/ServiceIcon';
import { parseText } from '@/app/utils/parseText';

const ServiceCard = ({
  title,
  description,
  backgroundImage,
  href,
  iconType,
  className = '',
}: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <div
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer group
        transition-all duration-500 ease-out
        ${isHovered ? 'transform scale-105' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Service: ${title}`}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={backgroundImage || '/placeholder.svg'}
          alt={title}
          fill
          className={`
            object-cover transition-all duration-700 ease-out
            ${isHovered ? 'scale-110 brightness-50' : 'brightness-75'}
          `}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div
          className={`
            flex items-center gap-4 transition-all duration-500 ease-out
            ${isHovered ? 'transform -translate-y-2' : ''}
          `}
        >
          <div
            className={`
              transition-all duration-500 ease-out
              ${isHovered ? 'scale-110 shadow-2xl' : ''}
            `}
          >
            <ServiceIcon type={iconType} />
          </div>
          <h3
            className={`
              text-white font-bold transition-all duration-500 ease-out
              ${isHovered ? 'text-xl scale-105' : 'text-lg'}
            `}
          >
            {title}
          </h3>
        </div>
        <div
          className={`
            transition-all duration-500 ease-out transform
            ${isHovered ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-8 invisible'}
          `}
        >
          <div className="bg-white bg-opacity-95 rounded-xl p-4 backdrop-blur-sm shadow-lg">
            <p className="text-[#272727] text-sm font-medium leading-relaxed">
              {parseText(description)}
            </p>
            <div
              className={`
                h-1 bg-[#9dfb40] rounded-full mt-3 transition-all duration-700 ease-out
                ${isHovered ? 'w-full' : 'w-0'}
              `}
            />
          </div>
        </div>
      </div>
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${isHovered ? 'opacity-100' : ''}
        `}
      >
        <div
          className={`
            absolute top-0 left-0 w-full h-full
            bg-gradient-to-r from-transparent via-white to-transparent
            opacity-20 transform -skew-x-12 transition-transform duration-1000
            ${isHovered ? 'translate-x-full' : '-translate-x-full'}
          `}
          style={{ width: '50%' }}
        />
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
