export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  iconType: string;
  href?: string;
}

export interface ServiceCardProps extends ServiceCardData {
  className?: string;
}

export interface IconProps {
  type: ServiceCardData['iconType'];
  className?: string;
}
