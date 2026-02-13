import { IconProps } from '@/app/ui/interfaces/icons';

export const BoxIcon = ({ className = '', size = 20 }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="7"
        y="9"
        width="22"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M7 15H29"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M15 9V27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
