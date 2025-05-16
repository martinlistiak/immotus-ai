import React from "react";
import { CustomDragLayer } from "./DragLayer";

interface DndProviderProps {
  children: React.ReactNode;
}

export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  return (
    <>
      <CustomDragLayer />
      {children}
    </>
  );
};
