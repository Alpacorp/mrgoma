import { ReactNode } from 'react';

import { PatchedIcon, RemainingIcon, RunFlatIcon, TreadIcon } from '@/app/ui/icons';

export type FeatureName =
  | 'Patched'
  | 'Remaining life'
  | 'Tread depth'
  | 'Run Flat'
  | 'Section width'
  | 'Aspect ratio'
  | 'Rim diameter'
  | 'Speed index'
  | 'Dot'
  | 'Product number'
  | string;

/**
 * Maps feature names to their corresponding icons
 * This follows the Single Responsibility Principle by only handling icon mapping
 * It's also Open for Extension by allowing easy addition of new mappings
 */
export const getIconForFeature = (featureName: FeatureName): ReactNode => {
  switch (featureName) {
    case 'Patched':
      return <PatchedIcon />;
    case 'Remaining life':
      return <RemainingIcon />;
    case 'Tread depth':
      return <TreadIcon />;
    case 'Run Flat':
      return <RunFlatIcon />;
    default:
      return <PatchedIcon />;
  }
};
