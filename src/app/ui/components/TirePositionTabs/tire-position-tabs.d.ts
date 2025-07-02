export type TirePosition = 'front' | 'rear';

export interface TirePositionTabsProps {
  activeTab: TirePosition;
  setActiveTab: (position: TirePosition) => void;
  hasRearTires: boolean;
}
