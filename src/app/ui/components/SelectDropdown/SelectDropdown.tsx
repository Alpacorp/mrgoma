import { FC } from 'react';

interface SelectDropdownProps {
  field: {
    type: string;
    label: string;
    options: { id: number; name: number }[];
  };
  selectedFilters: { width: string; sidewall: string; diameter: string };
  handleFilterChange: (value: string, type: 'width' | 'sidewall' | 'diameter') => void;
  isCollapsed?: boolean;
  showDefaultText?: boolean;
}

const SelectDropdown: FC<SelectDropdownProps> = ({
  field,
  selectedFilters,
  handleFilterChange,
  showDefaultText = true,
}) => {
  return (
    <select
      value={selectedFilters[field.type as keyof typeof selectedFilters]}
      onChange={e =>
        handleFilterChange(e.target.value, field.type as 'width' | 'sidewall' | 'diameter')
      }
      className={`w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-xs`}
    >
      <option value="">Select {showDefaultText && field.label}</option>
      {field.options.map(option => (
        <option key={option.id} value={String(option.name)}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

export default SelectDropdown;
