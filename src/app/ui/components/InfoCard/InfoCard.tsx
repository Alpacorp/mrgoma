import { InfoCardProps } from '@/app/ui/components/InfoCard/info-card';

import { InfoIcon } from './InfoIcon';

export const InfoCard = ({ id, title, description, iconType, className = '' }: InfoCardProps) => {
  return (
    <div
      className={`relative bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#9dfb40]/30 transition-all duration-300 overflow-hidden group ${className}`}
      role="article"
      aria-labelledby={`info-card-title-${id}`}
    >
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#9dfb40]/5 to-transparent" />
      <div className="relative flex flex-col items-center text-center">
        <div className="mb-6">
          <InfoIcon type={iconType} />
        </div>
        <h3
          id={`info-card-title-${id}`}
          className="text-white text-xl font-bold mb-4 uppercase tracking-wide"
        >
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;
