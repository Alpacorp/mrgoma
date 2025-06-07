interface IconProps {
  className?: string;
  size?: number;
}

export const CertifiedIcon = ({ className = '', size = 32 }: IconProps) => {
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
      {/* Engranaje exterior */}
      <path
        d="M12 1L14.5 4.5L18.5 3L19.5 7L23 8.5L21.5 12L23 15.5L19.5 17L18.5 21L14.5 19.5L12 23L9.5 19.5L5.5 21L4.5 17L1 15.5L2.5 12L1 8.5L4.5 7L5.5 3L9.5 4.5L12 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Círculo interior */}
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Símbolo de certificación (herramienta/llave) */}
      <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 10L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
};
