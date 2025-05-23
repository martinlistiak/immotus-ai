import React from "react";
import cn from "classnames";

interface AvatarProps {
  initial?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initial = "M",
  size = 24,
  backgroundColor = "#0e8d41",
  textColor = "#ffffff",
  className,
}) => {
  return (
    <div
      className={cn(className, {
        "border-2 border-[#131418] flex items-center justify-center rounded-full outline-1":
          true,
      })}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        fontSize: size * 0.5,
        backgroundColor,
        color: textColor,
        outlineColor: backgroundColor,
      }}
    >
      {initial}
    </div>
  );
};
