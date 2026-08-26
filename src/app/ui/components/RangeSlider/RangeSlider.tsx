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
  /** Names the pair for assistive technology, e.g. "price". */
  label?: string;
  /** Renders a value the way the buyer reads it, e.g. `$149`. */
  format?: (value: number) => string;
}

/**
 * Both thumbs were plain `<div>`s with mouse and touch handlers: no role, no
 * `tabIndex`, no keyboard. The control was **inoperable without a pointer** and
 * invisible to a screen reader — WCAG 2.1.1 Keyboard, a Level A failure — on
 * every surface that renders it: `/tires`, `/dashboard` and the home page's
 * "More filters". Found while building the filter rail, which could not claim
 * AA conformance while reusing it.
 *
 * The pointer behaviour below is untouched; everything added here is additive.
 */

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = '',
  label = 'value',
  format,
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

  /**
   * Arrow keys move by one step, Page keys by a tenth of the range, Home and End
   * jump to the ends. Each thumb is bounded by the other, exactly as dragging
   * is, so the two can never cross.
   */
  const handleKeyDown = (thumb: 'min' | 'max') => (event: React.KeyboardEvent) => {
    const page = Math.max(step, Math.round((max - min) / 10));
    const [lo, hi] = localValue;

    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = (thumb === 'min' ? lo : hi) + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = (thumb === 'min' ? lo : hi) - step;
        break;
      case 'PageUp':
        next = (thumb === 'min' ? lo : hi) + page;
        break;
      case 'PageDown':
        next = (thumb === 'min' ? lo : hi) - page;
        break;
      case 'Home':
        next = thumb === 'min' ? min : lo + step;
        break;
      case 'End':
        next = thumb === 'min' ? hi - step : max;
        break;
      default:
        return;
    }

    event.preventDefault();
    const bounded: [number, number] =
      thumb === 'min'
        ? [Math.min(Math.max(min, next), hi - step), hi]
        : [lo, Math.max(Math.min(max, next), lo + step)];

    if (bounded[0] === lo && bounded[1] === hi) return;
    setLocalValue(bounded);
    lastEmittedRef.current = bounded;
    onChange(bounded);
  };

  const describe = (v: number) => (format ? format(v) : String(v));

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
        role="slider"
        tabIndex={0}
        aria-label={`Minimum ${label}`}
        aria-valuemin={min}
        aria-valuemax={localValue[1] - step}
        aria-valuenow={localValue[0]}
        aria-valuetext={describe(localValue[0])}
        onKeyDown={handleKeyDown('min')}
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        style={{ left: `${getPercentage(localValue[0])}%` }}
        onMouseDown={() => handleMouseDown('min')}
        onTouchStart={() => handleTouchStart('min')}
      >
        <div className="w-4 h-4 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Maximum thumb */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Maximum ${label}`}
        aria-valuemin={localValue[0] + step}
        aria-valuemax={max}
        aria-valuenow={localValue[1]}
        aria-valuetext={describe(localValue[1])}
        onKeyDown={handleKeyDown('max')}
        className="absolute w-10 h-10 -ml-5 top-0 -mt-1.5 cursor-pointer flex items-center justify-center touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
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
