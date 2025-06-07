import { InfoCard } from '@/app/ui/components';
import { InfoCardData } from '@/app/ui/components/InfoCard/info-card';
import { infoCardsData } from '@/app/ui/sections/InfoCardsSection/InfoCardsData';

interface InfoCardsSectionProps {
  cards?: InfoCardData[];
  className?: string;
  title?: string;
}

export const InfoCardsSection = ({
  cards = infoCardsData,
  className = '',
  title,
}: InfoCardsSectionProps) => {
  if (!cards.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No information cards available.</p>
      </div>
    );
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#272727]">{title}</h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map(card => (
            <InfoCard key={card.id} {...card} className="h-full" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoCardsSection;
