'use client';

import { useCallback } from 'react';

import { ServiceCard } from '@/app/ui/components';
import { ServiceCardData } from '@/app/ui/components/ServiceCard/service';
import { TitleSection } from '@/app/ui/sections';

import { servicesData } from './servicesData';

interface ServicesGridProps {
  services?: ServiceCardData[];
  className?: string;
  onServiceClick?: (serviceId: string) => void;
}

export const ServicesGrid = ({
  services = servicesData,
  className = '',
  onServiceClick,
}: ServicesGridProps) => {
  const handleServiceClick = useCallback(
    (serviceId: string) => {
      onServiceClick?.(serviceId);
      // Aquí podrías añadir analytics, logging, etc.
      console.log(`Service clicked: ${serviceId}`);
    },
    [onServiceClick]
  );

  if (!services.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <section className={`${className}`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              {...service}
              onCardClick={handleServiceClick}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
