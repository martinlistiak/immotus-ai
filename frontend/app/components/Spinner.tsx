import React from "react";
import cn from "classnames";

interface SpinnerProps {
  size?: "sm" | "default" | "lg";
  color?: "default" | "primary";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "default",
  color = "default",
  className,
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-t-2",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-16 w-16": size === "lg",
          "border-gray-300": color === "default",
          "border-active": color === "primary",
        },
        className
      )}
    />
  );
};
