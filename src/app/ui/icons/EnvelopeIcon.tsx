import { IconProps } from '@/app/ui/interfaces/icons';

export const EnvelopeIcon:React.FC<IconProps>= ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 10.5C5 9.11929 6.11929 8 7.5 8H28.5C29.8807 8 31 9.11929 31 10.5V25.5C31 26.8807 29.8807 28 28.5 28H7.5C6.11929 28 5 26.8807 5 25.5V10.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11L18 18L29 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
