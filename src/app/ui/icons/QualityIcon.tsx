interface IconProps {
  className?: string
  size?: number
}

export const QualityIcon = ({ className = "", size = 32 }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Medalla exterior */}
      <path
        d="M12 2L14.5 7L20 7.5L16.5 11.5L17.5 17L12 14.5L6.5 17L7.5 11.5L4 7.5L9.5 7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Círculo interior */}
      <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Check mark */}
      <path
        d="M9.5 10L11 11.5L14.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cintas */}
      <path
        d="M8 14L6 22L9 20L12 22L10 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 14L18 22L15 20L12 22L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
