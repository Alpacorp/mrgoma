export interface LocationData {
  id: string;
  name: string;
  address: string;
  locationStore: string;
  phone: string;
  backgroundImage: string;
  link?: string;
  /** The store's city; pickup only allows stores in the tires' city (feature 041). */
  city?: 'Miami' | 'Orlando';
}

export interface LocationCardProps extends LocationData {
  className?: string;
}
