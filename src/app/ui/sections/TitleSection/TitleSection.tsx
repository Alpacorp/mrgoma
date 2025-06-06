import { ArrowsToRight } from '@/app/ui/icons';

export interface SectionHeaderProps {
  title: string;
  textColor?: string;
}

export const TitleSection = ({ title, textColor = '#272727' }: SectionHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-center gap-6 py-8 bg-white max-w-3xl m-auto rounded-tl-3xl rounded-tr-3xl`}
      role="banner"
      aria-label={`Section: ${title}`}
    >
      <ArrowsToRight className="w-20 h-6" />
      <h2 className={`text-4xl font-bold`} style={{ color: textColor }}>
        {title}
      </h2>
    </div>
  );
};

export default TitleSection;
