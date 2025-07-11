import { ArrowsToRight } from '@/app/ui/icons';

export interface SectionHeaderProps {
  title: string;
  color?: string;
}

/**
 * A title section component. It renders a title with an arrow icon next to it.
 * The title is rendered as a heading element of level 2.
 */
export const TitleSection = ({ title, color = '#272727' }: SectionHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-center gap-6 py-8 bg-white max-w-3xl m-auto rounded-tl-3xl rounded-tr-3xl border border-b-0 border-lime-400`}
      role="banner"
      aria-label={`Section: ${title}`}
    >
      <ArrowsToRight className="w-20 h-6" />
      <h2 className={`text-4xl font-bold`} style={{ color }}>
        {title}
      </h2>
    </div>
  );
};

export default TitleSection;
