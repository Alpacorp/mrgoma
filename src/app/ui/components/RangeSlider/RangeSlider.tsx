"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 1, value, onChange, className = "" }) => {
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (value: number) => {
      return ((value - min) / (max - min)) * 100;
    },
    [min, max],
  );

  const handleMouseDown = (thumb: "min" | "max") => {
    setDragging(thumb);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(null);
        onChange(localValue);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const slider = document.getElementById("range-slider");
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const newValue = Math.round((percentage * (max - min) + min) / step) * step;

      setLocalValue((prev) => {
        if (dragging === "min") {
          const clampedValue = Math.min(newValue, prev[1] - step);
          return [Math.max(min, clampedValue), prev[1]];
        } else {
          const clampedValue = Math.max(newValue, prev[0] + step);
          return [prev[0], Math.min(max, clampedValue)];
        }
      });
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [dragging, max, min, onChange, step, localValue]);

  return (
    <div id="range-slider" className={`relative h-7 ${className}`}>
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
        className="absolute w-7 h-7 -ml-3.5 top-0 cursor-pointer flex items-center justify-center"
        style={{ left: `${getPercentage(localValue[0])}%` }}
        onMouseDown={() => handleMouseDown("min")}
      >
        <div className="w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Maximum thumb */}
      <div
        className="absolute w-7 h-7 -ml-3.5 top-0 cursor-pointer flex items-center justify-center"
        style={{ left: `${getPercentage(localValue[1])}%` }}
        onMouseDown={() => handleMouseDown("max")}
      >
        <div className="w-3 h-3 bg-white border-2 border-green-500 rounded-full" />
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="min" value={localValue[0]} />
      <input type="hidden" name="max" value={localValue[1]} />
    </div>
  );
};

export default RangeSlider;
