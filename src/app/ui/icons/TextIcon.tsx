import { FC } from 'react';

import { IconsProps } from '@/app/ui/icons/icons';

export const TextIcon: FC<IconsProps> = ({ className, fill }) => {
  return (
    <svg
      className={className}
      width="47"
      height="47"
      viewBox="0 0 47 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="icon text" clipPath="url(#clip0_307_227)">
        <g id="Capa 1">
          <g id="Group">
            <path
              id="Vector"
              d="M39.6462 22.2083V24.8525L39.2881 27.0426C37.8941 33.3604 32.6889 38.3258 26.3135 39.4352L24.8556 39.6431C23.9891 39.6015 23.0715 39.7006 22.2114 39.6431C15.2733 39.1891 9.22728 33.7313 7.76292 26.9914C5.16993 15.056 16.2453 4.66484 28.0017 8.01558C34.262 9.79967 39.2209 15.6603 39.6462 22.2115V22.2083ZM37.6031 23.532C37.6031 15.7594 31.3045 9.46075 23.5319 9.46075C15.7593 9.46075 9.46068 15.7594 9.46068 23.532C9.46068 31.3046 15.7593 37.6032 23.5319 37.6032C31.3045 37.6032 37.6031 31.3046 37.6031 23.532Z"
              fill={fill || '#C7CDD2'}
            />
            <path
              id="Vector_2"
              d="M16.2166 15.3469H30.809V19.8199H29.0664L28.6348 17.115L28.2639 16.7953H25.2233V30.5596L25.6549 30.956L27.2983 31.0935V32.3309H19.724V31.0935L21.3802 30.956L21.799 30.5596V16.7953H18.7712L18.3875 17.115L17.9559 19.8199H16.2134V15.3469H16.2166Z"
              fill={fill || '#C7CDD2'}
            />
            <path
              id="Vector_3"
              d="M23.5 4.79592C33.8304 4.79592 42.2041 13.1696 42.2041 23.5C42.2041 33.8304 33.8304 42.2041 23.5 42.2041C13.1696 42.2041 4.79592 33.8304 4.79592 23.5C4.79592 13.1696 13.1696 4.79592 23.5 4.79592ZM23.5 0C10.5414 0 0 10.5414 0 23.5C0 36.4586 10.5414 47 23.5 47C36.4586 47 47 36.4586 47 23.5C47 10.5414 36.4586 0 23.5 0Z"
              fill={fill || '#C7CDD2'}
            />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_307_227">
          <rect width="47" height="47" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
