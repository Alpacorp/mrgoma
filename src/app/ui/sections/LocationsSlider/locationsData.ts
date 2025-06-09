import type { LocationData } from '@/app/ui/components/LocationCard/location-card';

export const locationsData: LocationData[] = [
  {
    id: 'location-1',
    name: 'Mr. Goma Tires - Main Location',
    address: '18200 S Dixie Hwy, Miami, FL 33157',
    phone: '305-278-4632',
    backgroundImage: '/assets/images/18200.png',
    coordinates: {
      lat: 25.6066,
      lng: -80.3135,
    },
  },
  {
    id: 'location-2',
    name: 'Mr. Goma Tires - South Branch',
    address: '20282 NW 2nd Ave, Miami, FL 33169',
    phone: '(305)770-1154',
    backgroundImage: '/assets/images/20282.png',
    coordinates: {
      lat: 25.6066,
      lng: -80.3135,
    },
  },
  {
    id: 'location-3',
    name: 'Mr. Goma Tires - Service Center',
    address: '3251 NW 27th Ave, Miami, FL 33142',
    phone: '786-555-0192',
    backgroundImage: '/assets/images/3251.png',
    coordinates: {
      lat: 25.6066,
      lng: -80.3135,
    },
  },
  {
    id: 'location-4',
    name: 'Mr. Goma Tires - Express',
    address: '900 South Le Jeune Rd, Miami, FL 33134',
    phone: '305-123-4567',
    backgroundImage: '/assets/images/900.png',
    coordinates: {
      lat: 25.6066,
      lng: -80.3135,
    },
  },
];
