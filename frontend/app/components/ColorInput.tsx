import { useState } from "react";
import { Input } from "./Input";

export const ColorInput = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Input
      // @ts-ignore
      prefix={
        <div
          className="w-5 h-5 rounded-sm border border-gray-700"
          style={{ backgroundColor: props.value as string }}
        />
      }
      {...props}
    />
  );
};
