'use client';

import Image from 'next/image';

import { LocationIcon, PhoneIcon } from '@/app/ui/icons';

import { LocationCardProps } from './location-card';

export const LocationCard = ({
  id,
  name,
  address,
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
    onLocationClick?.({ id, name, address, phone, backgroundImage, coordinates });
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
      <div className="relative h-64 w-full">
        <Image
          src={backgroundImage || '/placeholder.svg'}
          alt={`${name} location`}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between items-end gap-4">
          <button
            onClick={handleLocationClick}
            className="flex items-center gap-2 transition-colors group"
            aria-label={`Open ${address} in Google Maps`}
          >
            <LocationIcon className="group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white font-medium hover:text-[#7bc42d]">{address}</span>
          </button>
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-2 transition-colors group"
            aria-label={`Call ${phone}`}
          >
            <PhoneIcon className="group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white hover:text-[#7bc42d] font-medium">{phone}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
