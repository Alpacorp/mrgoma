'use client';

import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';

// Create a context for the dialog state
interface DialogContextType {
  isOpen: boolean;
  close: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Custom hook to use the dialog context
const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog component');
  }
  return context;
};

// Main Dialog component
interface DialogProps {
  children: ReactNode;
  open: boolean;
  onCloseAction: () => void;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  open,
  onCloseAction,
  className = '',
}) => {
  // Handle an ESC key to close a dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onCloseAction();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCloseAction]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // This cleanup function runs when the component unmounts or before the effect runs again
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ isOpen: open, close: onCloseAction }}>
      <div className={className} role="dialog" aria-modal="true">
        {children}
      </div>
    </DialogContext.Provider>
  );
};

// Backdrop component
interface DialogBackdropProps {
  className?: string;
  transition?: boolean;
  onClick?: () => void;
}

export const DialogBackdrop: React.FC<DialogBackdropProps> = ({
  className = '',
  transition = false,
  onClick,
}) => {
  const { close } = useDialog();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    }
    
    close();
  };

  return (
    <div
      className={`${className} ${!transition ? 'opacity-0' : 'opacity-40'} transition-opacity duration-300`}
      onClick={handleClick}
      data-closed={!transition}
    />
  );
};

// Panel component
interface DialogPanelProps {
  children: ReactNode;
  className?: string;
  transition?: boolean;
}

export const DialogPanel: React.FC<DialogPanelProps> = ({
  children,
  className = '',
  transition = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Prevent clicks inside the panel from closing the dialog
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={panelRef}
      className={`${className} ${!transition ? 'translate-x-full' : 'translate-x-0'} transition-transform duration-300 ease-in-out`}
      onClick={handleClick}
      data-closed={!transition}
    >
      {children}
    </div>
  );
};
