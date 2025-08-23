'use client';

import Image from 'next/image';

import { LocationIcon, PhoneIcon } from '@/app/ui/icons';

import { LocationCardProps } from './location-card';

export const LocationCard = ({
  id,
  name,
  address,
  locationStore,
  phone,
  backgroundImage,
  coordinates,
  className = '',
  onLocationClick,
  onPhoneClick,
}: LocationCardProps) => {
  const getGoogleMapsUrl = () => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getPhoneUrl = () => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `tel:${cleanPhone}`;
  };

  const handleLocationClick = () => {
    onLocationClick?.({ id, name, address, phone, backgroundImage, coordinates, locationStore });
    window.open(getGoogleMapsUrl(), '_blank');
  };

  const handlePhoneClick = () => {
    onPhoneClick?.(phone);
    window.open(getPhoneUrl());
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        transition-all duration-300 ease-in-out shadow-lg
        ${className}
      `}
      role="article"
      aria-label={`Location: ${name}`}
    >
      <div className="relative h-96 w-full">
        <Image
          src={backgroundImage || '/placeholder.svg'}
          alt={`${name} location`}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <button
            onClick={handleLocationClick}
            className="flex gap-2 transition-colors cursor-pointer group"
            aria-label={`Open ${address} in Google Maps`}
          >
            <LocationIcon className="group-hover:scale-110 transition-transform" />
            <div className="flex flex-col gap-1" aria-label={`Address and Store`} role="group">
              <span className="text-sm text-left text-white font-medium hover:underline hover:underline-offset-8">
                {address}
              </span>
              <span className="text-sm text-left text-white font-medium hover:underline hover:underline-offset-8">
                {locationStore}
              </span>
            </div>
          </button>
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-2 transition-colors cursor-pointer group"
            aria-label={`Call ${phone}`}
          >
            <PhoneIcon className="group-hover:scale-110 transition-transform" />
            <span className="text-sm text-left text-white font-medium hover:underline hover:underline-offset-8">
              {phone}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
