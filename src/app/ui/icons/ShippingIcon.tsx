interface IconProps {
  className?: string
  size?: number
}

export const ShippingIcon = ({ className = "", size = 32 }: IconProps) => {
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
      {/* Caja/Paquete */}
      <path
        d="M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Líneas de la caja */}
      <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Reloj/Cronómetro */}
      <circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M17 6V8L18.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Líneas de velocidad */}
      <path d="M2 10H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
