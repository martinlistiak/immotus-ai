import React from "react";
import { useDragLayer } from "react-dnd";
import type { DragItem } from "./GenericTree";

interface DragLayerProps {
  renderIcon?: (nodeType: string) => React.ReactNode;
}

export const GenericDragLayer = ({ renderIcon }: DragLayerProps) => {
  const { isDragging, item, currentOffset, initialOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem() as DragItem,
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
    })
  );

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: currentOffset.x,
          top: currentOffset.y,
          transform: `translate(${initialOffset?.x}px, -50%)`,
        }}
      >
        <div className="px-2 py-1 rounded bg-gray-800 text-white text-xs flex items-center gap-2 shadow-lg border border-gray-700">
          {renderIcon ? renderIcon(item.type) : null}
          {item.name}
        </div>
      </div>
    </div>
  );
};
