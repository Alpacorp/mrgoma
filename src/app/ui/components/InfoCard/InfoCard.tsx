import { InfoCardProps } from '@/app/ui/components/InfoCard/info-card';

import { InfoIcon } from './InfoIcon';

export const InfoCard = ({ id, title, description, iconType, className = '' }: InfoCardProps) => {
  return (
    <div
      className={`
        relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-in-out hover:-translate-y-2
        overflow-hidden group
        ${className}
      `}
      role="article"
      aria-labelledby={`info-card-title-${id}`}
    >
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#9dfb40]/20 to-transparent" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6">
          <InfoIcon type={iconType} />
        </div>
        <h3
          id={`info-card-title-${id}`}
          className="text-[#272727] text-xl font-bold mb-4 uppercase tracking-wide"
        >
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;
