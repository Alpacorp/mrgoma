import { TireSize } from '@/app/ui/interfaces/tireSize';

export interface SizeSelectorsProps {
  position: 'rear' | 'all';
  width: { id: number; name: number }[];
  sidewall: { id: number; name: number }[];
  diameter: { id: number; name: number }[];
  currentSize: { width: string; sidewall: string; diameter: string };
  handleFilterChange: (value: string, type: keyof TireSize, position: 'rear' | 'all') => void;
  removeFilter: (type: keyof TireSize, position: 'rear' | 'all') => void;
}
