import { IconProps } from '@/app/ui/components/InfoCard/info-card';
import { CertifiedIcon, GuaranteeIcon, QualityIcon, ShippingIcon } from '@/app/ui/icons';

export const InfoIcon = ({ type, className = '' }: IconProps) => {
  const getIconPath = () => {
    switch (type) {
      case 'guarantee':
        return <GuaranteeIcon className="text-[#9dfb40]" size={32} />;
      case 'quality':
        return <QualityIcon className="text-[#9dfb40]" size={32} />;
      case 'shipping':
        return <ShippingIcon className="text-[#9dfb40]" size={32} />;
      case 'certified':
        return <CertifiedIcon className="text-[#9dfb40]" size={32} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-20 h-20 rounded-full bg-[#272727] border-4 border-[#9dfb40] flex items-center justify-center ${className}`}
    >
      {getIconPath()}
    </div>
  );
};
