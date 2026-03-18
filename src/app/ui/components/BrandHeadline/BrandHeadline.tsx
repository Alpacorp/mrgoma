import { FC } from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface BrandHeadlineProps {
  as?: HeadingTag;
  size?: 'sm' | 'lg';
  className?: string;
  inline?: boolean;
}

const BrandHeadline: FC<BrandHeadlineProps> = ({
  as: Tag = 'h1',
  size = 'lg',
  className,
  inline = false,
}) => {
  const mainClass =
    size === 'lg'
      ? 'text-3xl sm:text-4xl md:text-5xl uppercase font-extrabold text-white tracking-tight [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.45)]'
      : 'text-base sm:text-2xl uppercase font-extrabold text-white tracking-tight [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.45)]';

  const subClass =
    size === 'lg'
      ? 'text-2xl sm:text-3xl font-semibold sm:font-bold uppercase text-white tracking-tight'
      : 'text-sm sm:text-xl font-semibold uppercase text-white tracking-tight';

  const wrapperClass = `${inline ? 'flex items-baseline justify-center gap-2 whitespace-nowrap' : 'text-center'}${className ? ` ${className}` : ''}`;

  if (inline) {
    return (
      <div className={wrapperClass}>
        <span className={subClass}>
          The <span className="text-lime-400">Tires</span> you{' '}
          <span className="text-lime-400">need</span>
        </span>
        <span className={subClass}>
          The <span className="text-lime-400">Price</span> you{' '}
          <span className="text-lime-400">want</span>
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Tag className={mainClass}>
        The <span className="text-lime-400">Tires</span> you{' '}
        <span className="text-lime-400">need</span>
      </Tag>
      <p className={subClass}>
        The <span className="text-lime-400">Price</span> you{' '}
        <span className="text-lime-400">want</span>
      </p>
    </div>
  );
};

export default BrandHeadline;
