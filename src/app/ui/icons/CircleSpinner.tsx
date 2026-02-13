import { IconProps } from '@/app/ui/interfaces/icons';

const CircleSpinner: React.FC<IconProps> = ({ className = '', size = 20 }) => {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
      <circle
        width={size}
        height={size}
        className={`opacity-25 ${className}`}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <circle
        className={`opacity-75 ${className}`}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="60"
        strokeDashoffset="20"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default CircleSpinner;
