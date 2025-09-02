export interface LocationData {
  id: string;
  name: string;
  address: string;
  locationStore: string;
  phone: string;
  backgroundImage: string;
  link?: string;
}

export interface LocationCardProps extends LocationData {
  className?: string;
}
