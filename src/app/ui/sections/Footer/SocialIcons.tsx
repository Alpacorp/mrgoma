interface SocialIconProps {
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "x" | "tiktok"
  className?: string
  size?: number
}

export const SocialIcon = ({ platform, className = "", size = 24 }: SocialIconProps) => {
  const getIconPath = () => {
    switch (platform) {
      case "instagram":
        return (
          <>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case "facebook":
        return (
          <path
            d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        );
      case "twitter":
        return (
          <path
            d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        );
      case "linkedin":
        return (
          <>
            <path
              d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
          </>
        );
      case "x":
        // Accurate X (formerly Twitter) logo path (based on Simple Icons). Using fill=currentColor for brand-correct look.
        return (
          <path
            d="M18.244 2H21.5l-7.59 8.682L23 22h-6.344l-4.957-6.137L5.9 22H2.641l8.096-9.26L1 2h6.461l4.478 5.757L18.244 2zm-2.232 17.35h1.751L7.054 4.56H5.234l10.778 14.79z"
            fill="currentColor"
          />
        );
      case "tiktok":
        // Accurate TikTok logo path (based on Simple Icons). Using fill=currentColor.
        return (
          <path
            d="M12.43 2.001h3.203c.329 2.24 2.138 3.932 4.56 4.097v3.253a7.54 7.54 0 0 1-4.094-1.246v6.027c0 3.97-3.218 7.188-7.187 7.188S1.724 18.102 1.724 14.133c0-3.97 3.218-7.188 7.188-7.188.452 0 .893.041 1.317.12v3.35a3.9 3.9 0 0 0-1.317-.236 3.57 3.57 0 1 0 3.57 3.57V2.001z"
            fill="currentColor"
          />
        );
      default:
        return null;
    }
  };

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
      {getIconPath()}
    </svg>
  );
};
