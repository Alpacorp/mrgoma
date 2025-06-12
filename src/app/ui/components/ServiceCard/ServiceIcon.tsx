import { IconProps } from '@/app/ui/components/ServiceCard/service';
import {
  AlignmentIcon,
  BalancingIcon,
  BrakesIcon,
  OilIcon,
  RepairIcon,
  RotationIcon,
} from '@/app/ui/icons';

export const ServiceIcon = ({ type }: IconProps) => {
  const getIconPath = () => {
    switch (type) {
      case 'tire':
        return <BalancingIcon />;
      case 'alignment':
        return <AlignmentIcon />;
      case 'repair':
        return <RepairIcon />;
      case 'rotation':
        return <RotationIcon />;
      case 'brakes':
        return <BrakesIcon />;
      case 'oil':
        return <OilIcon />;
      default:
        return null;
    }
  };

  return <>{getIconPath()}</>;
};
