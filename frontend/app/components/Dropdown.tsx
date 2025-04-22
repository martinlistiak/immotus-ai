import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Card } from "./Card";

interface DropdownProps {
  items: ReactNode[];
  children: ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <Card className="absolute z-10 mt-2 w-max min-w-full shadow-lg !p-1 top-full left-1/2 -translate-x-1/2">
          <div className="">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
