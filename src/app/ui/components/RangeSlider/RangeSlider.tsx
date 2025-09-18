'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

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

  const sliderRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
    lastEmittedRef.current = value;
  }, [value]);

  const getPercentage = useCallback(
    (value: number) => {
      if (!value && value !== 0) return 0;
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

      const slider = sliderRef.current;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round((percentage * (max - min) + min) / step) * step;

      setLocalValue(prev => {
        let next: [number, number];
        if (dragging === 'min') {
          const clampedValue = Math.min(newValue, prev[1] - step);
          next = [Math.max(min, clampedValue), prev[1]];
        } else {
          const clampedValue = Math.max(newValue, prev[0] + step);
          next = [prev[0], Math.min(max, clampedValue)];
        }
        if (next[0] !== prev[0] || next[1] !== prev[1]) {
          onChange(next);
          lastEmittedRef.current = next;
        }
        return next;
      });
    },
    [dragging, max, min, step, onChange]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(null);
        if (
          localValue[0] !== lastEmittedRef.current[0] ||
          localValue[1] !== lastEmittedRef.current[1]
        ) {
          onChange(localValue);
          lastEmittedRef.current = localValue;
        }
      }
    };

    const handleTouchEnd = () => {
      if (dragging) {
        setDragging(null);
        if (
          localValue[0] !== lastEmittedRef.current[0] ||
          localValue[1] !== lastEmittedRef.current[1]
        ) {
          onChange(localValue);
          lastEmittedRef.current = localValue;
        }
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
    // Use type assertion to fix the TypeScript error with a passive option
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
    <div ref={sliderRef} className={`relative h-7 ${className}`} style={{ touchAction: 'none' }}>
      {/* Track background */}
      <div className="absolute h-2 w-full bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />

      {/* Selected range */}
      <div
        className="absolute h-2 bg-green-500 rounded-full top-1/2 -translate-y-1/2"
        style={{
          left: `${Array.isArray(localValue) ? getPercentage(localValue[0]) : 0}%`,
          width: Array.isArray(localValue)
            ? `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`
            : '0%',
          opacity: Array.isArray(localValue) ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Minimum thumb */}
      <div
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation"
        style={{ left: `${getPercentage(localValue[0])}%` }}
        onMouseDown={() => handleMouseDown('min')}
        onTouchStart={() => handleTouchStart('min')}
      >
        <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Maximum thumb */}
      <div
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation"
        style={{ left: `${getPercentage(localValue[1])}%` }}
        onMouseDown={() => handleMouseDown('max')}
        onTouchStart={() => {
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
