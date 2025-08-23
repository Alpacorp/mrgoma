export interface LocationData {
  id: string;
  name: string;
  address: string;
  locationStore: string;
  phone: string;
  backgroundImage: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LocationCardProps extends LocationData {
  className?: string;
  onLocationClick?: (location: LocationData) => void;
  onPhoneClick?: (phone: string) => void;
}
