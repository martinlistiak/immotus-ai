import React from "react";
import { DndProvider as ReactDndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomDragLayer } from "./DragLayer";

interface DndProviderProps {
  children: React.ReactNode;
}

export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      {children}
    </ReactDndProvider>
  );
};
