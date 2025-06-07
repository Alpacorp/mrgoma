export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  icon: string;
  href?: string;
}

export interface ServiceCardProps extends ServiceCardData {
  className?: string;
}
