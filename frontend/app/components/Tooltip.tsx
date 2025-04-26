import { useState, useRef, useEffect } from "react";
import cn from "classnames";

type Position = "top" | "right" | "bottom" | "left";

export const Tooltip = ({
  children,
  text,
  initialPosition = "bottom",
  offset = 8,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  text: string;
  initialPosition?: Position;
  offset?: number;
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});

  const handleVisibleChange = (visible: boolean) => {
    setIsVisible(visible && !!text);
    if (!visible) {
      setPosition(initialPosition);
    }
  };

  // Calculate best position based on available space
  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if there's enough space in each direction
    const spaceTop = container.top;
    const spaceRight = viewportWidth - container.right;
    const spaceBottom = viewportHeight - container.bottom;
    const spaceLeft = container.left;

    // Calculate optimal position based on available space
    const positions: Position[] = ["top", "right", "bottom", "left"];
    const spaces = [spaceTop, spaceRight, spaceBottom, spaceLeft];

    // Start with initial position preference
    let bestPosition = initialPosition;

    // If there's not enough space in the initial position, find the best alternative
    if (
      (initialPosition === "top" && spaceTop < tooltip.height + offset) ||
      (initialPosition === "right" && spaceRight < tooltip.width + offset) ||
      (initialPosition === "bottom" && spaceBottom < tooltip.height + offset) ||
      (initialPosition === "left" && spaceLeft < tooltip.width + offset)
    ) {
      // Find position with most space
      const maxSpace = Math.max(...spaces);
      const maxIndex = spaces.indexOf(maxSpace);
      bestPosition = positions[maxIndex];
    }

    setPosition(bestPosition);

    // Apply position-specific styles
    const newStyles: React.CSSProperties = {
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? "visible" : "hidden",
      transition: `opacity 150ms, visibility 150ms, transform 150ms`,
    };

    switch (bestPosition) {
      case "top":
        newStyles.bottom = `calc(100% + ${offset}px)`;
        newStyles.left = "50%";
        newStyles.transform = "translateX(-50%)";
        break;
      case "right":
        newStyles.left = `calc(100% + ${offset}px)`;
        newStyles.top = "50%";
        newStyles.transform = "translateY(-50%)";
        break;
      case "bottom":
        newStyles.top = `calc(100% + ${offset}px)`;
        newStyles.left = "50%";
        newStyles.transform = "translateX(-50%)";
        break;
      case "left":
        newStyles.right = `calc(100% + ${offset}px)`;
        newStyles.top = "50%";
        newStyles.transform = "translateY(-50%)";
        break;
    }

    setTooltipStyles(newStyles);
  };

  // Handle hover events
  const handleMouseEnter = () => {
    if (delay) {
      const timer = setTimeout(() => handleVisibleChange(true), delay);
      return () => clearTimeout(timer);
    } else {
      handleVisibleChange(true);
    }
  };

  const handleMouseLeave = () => {
    handleVisibleChange(false);
  };

  // Recalculate position when visibility changes or on window resize
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }

    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible]);

  return (
    <div
      className={cn("relative inline-flex", className)}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <div
        ref={tooltipRef}
        style={tooltipStyles}
        className={cn({
          "absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs bg-gray-800 text-gray-300 border border-gray-700 capitalize shadow-md":
            true,
          "pointer-events-none": true,
          "opacity-0 hidden": !isVisible,
          "opacity-100 visible": isVisible,
        })}
      >
        {text}
      </div>
    </div>
  );
};
