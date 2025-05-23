import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import cn from "classnames";

type Position = "top" | "right" | "bottom" | "left";

export const Tooltip = ({
  children,
  text,
  id,
  initialPosition = "bottom",
  offset = 8,
  delay = 0,
  className,
  capitalize = true,
}: {
  children: React.ReactNode;
  text: React.ReactNode;
  id?: string;
  initialPosition?: Position;
  offset?: number;
  delay?: number;
  className?: string;
  capitalize?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleVisibleChange = (visible: boolean) => {
    setIsVisible(visible && !!text);
    if (!visible) {
      setPosition(initialPosition);
    }
  };

  // Calculate tooltip position based on container position
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

    // Calculate coordinates based on position
    let top = 0;
    let left = 0;

    switch (bestPosition) {
      case "top":
        top = container.top - tooltip.height - offset;
        left = container.left + container.width / 2 - tooltip.width / 2;
        break;
      case "right":
        top = container.top + container.height / 2 - tooltip.height / 2;
        left = container.right + offset;
        break;
      case "bottom":
        top = container.bottom + offset;
        left = container.left + container.width / 2 - tooltip.width / 2;
        break;
      case "left":
        top = container.top + container.height / 2 - tooltip.height / 2;
        left = container.left - tooltip.width - offset;
        break;
    }

    // Ensure tooltip stays within viewport
    if (left < 0) left = 0;
    if (left + tooltip.width > viewportWidth)
      left = viewportWidth - tooltip.width;
    if (top < 0) top = 0;
    if (top + tooltip.height > viewportHeight)
      top = viewportHeight - tooltip.height;

    setTooltipCoords({ top, left });
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

  // Recalculate position when visibility changes or on window resize or scroll
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }

    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("click", handleMouseLeave, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("click", handleMouseLeave, true);
    };
  }, [isVisible]);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  return (
    <div
      id={id}
      className={cn("relative inline-flex", className)}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              top: `${tooltipCoords.top}px`,
              left: `${tooltipCoords.left}px`,
              opacity: isVisible ? 1 : 0,
              visibility: isVisible ? "visible" : "hidden",
              transition: "opacity 150ms, visibility 150ms",
              zIndex: 9999,
            }}
            className={cn({
              "whitespace-nowrap rounded-md px-2 py-1 text-xs bg-gray-800 text-gray-300 border border-gray-700 shadow-md":
                true,
              "pointer-events-none": true,
              capitalize: capitalize,
            })}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};
