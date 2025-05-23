import { useEffect, useRef, useState } from "react";
import cn from "classnames";

export type SliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
  disabled?: boolean;
};

export const Slider = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className,
  disabled = false,
}: SliderProps) => {
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Calculate positions and percentages
  const getPercent = (value: number) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  // Handle mouse/touch interaction
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickValue = Math.round(((max - min) * percent) / 100) + min;

    // Determine which thumb to move based on which is closer
    const distToMin = Math.abs(clickValue - localValue[0]);
    const distToMax = Math.abs(clickValue - localValue[1]);

    const newValues = [...localValue] as [number, number];

    if (distToMin <= distToMax) {
      newValues[0] = Math.min(clickValue, localValue[1] - step);
    } else {
      newValues[1] = Math.max(clickValue, localValue[0] + step);
    }

    setLocalValue(newValues);
    onChange(newValues);
  };

  const handleThumbMouseDown =
    (thumbType: "min" | "max") => (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveThumb(thumbType);
    };

  useEffect(() => {
    if (!activeThumb) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.min(
        Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
        100
      );
      let newValue = Math.round(((max - min) * percent) / 100) + min;

      // Step alignment
      newValue = Math.round(newValue / step) * step;

      const newValues = [...localValue] as [number, number];

      if (activeThumb === "min") {
        newValues[0] = Math.min(Math.max(min, newValue), localValue[1] - step);
      } else {
        newValues[1] = Math.max(Math.min(max, newValue), localValue[0] + step);
      }

      setLocalValue(newValues);
      onChange(newValues);
    };

    const handleMouseUp = () => {
      setActiveThumb(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, localValue, min, max, onChange, step]);

  return (
    <div
      className={cn(
        "relative h-6 w-full cursor-pointer",
        { "opacity-50 cursor-not-allowed": disabled },
        className
      )}
    >
      <div
        ref={trackRef}
        className="absolute h-1 bg-gray-800 rounded-md w-full top-1/2 -translate-y-1/2"
        onClick={handleTrackClick}
      >
        {/* Active track section */}
        <div
          className="absolute h-full bg-active-hover rounded-md"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
      </div>

      {/* Min thumb */}
      <div
        className={cn(
          "absolute w-3 h-3 bg-active-hover rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 shadow-md hover:scale-110 transition-transform",
          { "z-10 scale-110": activeThumb === "min" }
        )}
        style={{ left: `${minPercent}%` }}
        onMouseDown={handleThumbMouseDown("min")}
      />

      {/* Max thumb */}
      <div
        className={cn(
          "absolute w-3 h-3 bg-active-hover rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 shadow-md hover:scale-110 transition-transform",
          { "z-10 scale-110": activeThumb === "max" }
        )}
        style={{ left: `${maxPercent}%` }}
        onMouseDown={handleThumbMouseDown("max")}
      />
    </div>
  );
};
