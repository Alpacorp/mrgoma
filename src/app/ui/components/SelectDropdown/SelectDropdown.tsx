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
  disabled?: boolean;
}

const SelectDropdown: FC<SelectDropdownProps> = ({
  field,
  selectedFilters,
  handleFilterChange,
  showDefaultText = true,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <select
        value={selectedFilters[field.type as keyof typeof selectedFilters]}
        onChange={e =>
          handleFilterChange(e.target.value, field.type as 'width' | 'sidewall' | 'diameter')
        }
        className={`w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-xs appearance-none
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        disabled={disabled}
      >
        <option value="">Select {showDefaultText && field.label}</option>
        {field.options.map(option => (
          <option key={option.id} value={String(option.name)}>
            {option.name}
          </option>
        ))}
      </select>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default SelectDropdown;
