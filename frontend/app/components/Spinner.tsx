import React from "react";
import cn from "classnames";

interface SpinnerProps {
  size?: "sm" | "default";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "default",
  className,
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-t-2 border-gray-300",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
        },
        className
      )}
    />
  );
};
