'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

import { MinusIcon, PlusIcon } from '@/app/ui/components/Icons/Icons';

// Create a context for the disclosure state
interface DisclosureContextType {
  isOpen: boolean;
  toggle: () => void;
}

const DisclosureContext = createContext<DisclosureContextType | undefined>(undefined);

// Custom hook to use the disclosure context
const useDisclosure = () => {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error('useDisclosure must be used within a Disclosure component');
  }
  return context;
};

// Main Disclosure component
interface DisclosureProps {
  children: ReactNode;
  defaultOpen?: boolean;
  as?: React.ElementType;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  children,
  defaultOpen = false,
  as: Component = 'div',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <DisclosureContext.Provider value={{ isOpen, toggle }}>
      <Component className={className} data-open={isOpen}>
        {children}
      </Component>
    </DisclosureContext.Provider>
  );
};

// Button component to toggle the disclosure
interface DisclosureButtonProps {
  children: ReactNode;
  className?: string;
}

export const DisclosureButton: React.FC<DisclosureButtonProps> = ({ children, className = '' }) => {
  const { toggle, isOpen } = useDisclosure();

  return (
    <button type="button" onClick={toggle} className={`group ${className}`} data-open={isOpen}>
      {children}
    </button>
  );
};

// Panel component that shows content when disclosure is open
interface DisclosurePanelProps {
  children: ReactNode;
  className?: string;
}

export const DisclosurePanel: React.FC<DisclosurePanelProps> = ({ children, className = '' }) => {
  const { isOpen } = useDisclosure();

  if (!isOpen) return null;

  return <div className={className}>{children}</div>;
};

// Icon component that shows either plus or minus based on the disclosure state
interface DisclosureIconProps {
  className?: string;
}

export const DisclosureIcon: React.FC<DisclosureIconProps> = ({ className = '' }) => {
  const { isOpen } = useDisclosure();

  return isOpen ? (
    <MinusIcon className={`${className} h-5 w-5 cursor-pointer`} />
  ) : (
    <PlusIcon className={`${className} h-5 w-5 cursor-pointer`} />
  );
};
