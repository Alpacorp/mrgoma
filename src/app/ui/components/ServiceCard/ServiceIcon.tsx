import { IconProps } from '@/app/ui/components/ServiceCard/service';
import {
  AlignmentIcon,
  BalancingIcon,
  BrakesIcon,
  NitroIcon,
  OilIcon,
  RepairIcon,
  RotationIcon,
  TpmsIcon,
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
      case 'tpms':
        return <TpmsIcon />;
      case 'nitrogen':
        return <NitroIcon />;
      default:
        return null;
    }
  };

  return <>{getIconPath()}</>;
};
