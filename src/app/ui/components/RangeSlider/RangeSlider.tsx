'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

// Define the AddEventListenerOptions interface if it's not available in the global scope
interface AddEventListenerOptions extends EventListenerOptions {
  passive?: boolean;
}

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = '',
}) => {
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const [sliderId] = useState(() => `range-slider-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (value: number) => {
      return ((value - min) / (max - min)) * 100;
    },
    [min, max]
  );

  const handleMouseDown = (thumb: 'min' | 'max') => {
    setDragging(thumb);
  };

  const handleTouchStart = (thumb: 'min' | 'max') => {
    setDragging(thumb);
  };

  // Common function to handle both mouse and touch movement
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!dragging) return;

      const slider = document.getElementById(sliderId);
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round((percentage * (max - min) + min) / step) * step;

      setLocalValue(prev => {
        if (dragging === 'min') {
          const clampedValue = Math.min(newValue, prev[1] - step);
          return [Math.max(min, clampedValue), prev[1]];
        } else {
          const clampedValue = Math.max(newValue, prev[0] + step);
          return [prev[0], Math.min(max, clampedValue)];
        }
      });
    },
    [dragging, max, min, step, sliderId]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(null);
        onChange(localValue);
      }
    };

    const handleTouchEnd = () => {
      if (dragging) {
        setDragging(null);
        onChange(localValue);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Only prevent default if we're actually dragging to avoid interfering with other touch events
        if (dragging) {
          e.preventDefault(); // Prevent scrolling during slider interaction
        }
        handlePointerMove(e.touches[0].clientX);
      }
    };

    // Add mouse event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    // Add touch event listeners
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
    // Use type assertion to fix the TypeScript error with passive option
    document.addEventListener(
      'touchmove',
      handleTouchMove as EventListener,
      { passive: false } as AddEventListenerOptions
    ); // passive: false allows preventDefault to work

    return () => {
      // Remove mouse event listeners
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);

      // Remove touch event listeners
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener(
        'touchmove',
        handleTouchMove as EventListener,
        { passive: false } as AddEventListenerOptions
      );
    };
  }, [dragging, handlePointerMove, onChange, localValue]);

  return (
    <div id={sliderId} className={`relative h-7 ${className}`} style={{ touchAction: 'none' }}>
      {/* Track background */}
      <div className="absolute h-2 w-full bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />

      {/* Selected range */}
      <div
        className="absolute h-2 bg-green-500 rounded-full top-1/2 -translate-y-1/2"
        style={{
          left: `${getPercentage(localValue[0])}%`,
          width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
        }}
      />

      {/* Minimum thumb */}
      <div
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation"
        style={{ left: `${getPercentage(localValue[0])}%` }}
        onMouseDown={() => handleMouseDown('min')}
        onTouchStart={e => {
          // Don't prevent default here to allow the event to be properly recognized
          handleTouchStart('min');
        }}
      >
        <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Maximum thumb */}
      <div
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation"
        style={{ left: `${getPercentage(localValue[1])}%` }}
        onMouseDown={() => handleMouseDown('max')}
        onTouchStart={e => {
          // Don't prevent default here to allow the event to be properly recognized
          handleTouchStart('max');
        }}
      >
        <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="min" value={localValue[0]} />
      <input type="hidden" name="max" value={localValue[1]} />
    </div>
  );
};

export default RangeSlider;
