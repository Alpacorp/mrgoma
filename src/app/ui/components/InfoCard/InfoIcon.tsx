import { IconProps } from '@/app/ui/components/InfoCard/info-card';
import { CertifiedIcon, GuaranteeIcon, QualityIcon, ShippingIcon } from '@/app/ui/icons';

export const InfoIcon = ({ type }: IconProps) => {
  const getIconPath = () => {
    switch (type) {
      case 'guarantee':
        return <GuaranteeIcon />;
      case 'quality':
        return <QualityIcon />;
      case 'shipping':
        return <ShippingIcon />;
      case 'certified':
        return <CertifiedIcon />;
      default:
        return null;
    }
  };

  return <>{getIconPath()}</>;
};
