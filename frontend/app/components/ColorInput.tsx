import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import { Input } from "./Input";

export const ColorInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  return (
    <div className="relative">
      <Input
        // @ts-ignore
        prefix={
          <div
            className="w-5 h-5 rounded-sm border border-gray-700"
            style={{ backgroundColor: props.value as string }}
          />
        }
        {...props}
        onFocus={(e) => {
          props.onFocus?.(e);
          setIsColorPickerOpen(true);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
          const target = e.relatedTarget as Node;
          const colorPicker = document.getElementById("colorPicker");
          if (colorPicker?.contains(target)) {
            return;
          }
          setIsColorPickerOpen(false);
        }}
      />
      {isColorPickerOpen && (
        <div id={"colorPicker"} className="absolute top-full right-0">
          <HexColorPicker
            className="z-50"
            color={props.value as string}
            onBlur={(e) => {
              setIsColorPickerOpen(false);
            }}
            onChange={(color) => {
              props.onChange?.({
                target: {
                  value: color,
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
          />
        </div>
      )}
    </div>
  );
};
