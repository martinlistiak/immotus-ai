import React from "react";
import { useDragLayer } from "react-dnd";
import { NodeIcon } from "app/components/NodeIcon";
import type { ObjectType } from "app/types/scene-ast";

interface DragItem {
  id: string;
  type: ObjectType;
  name: string;
}

export const CustomDragLayer = () => {
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
          <NodeIcon type={item.type} />
          {item.name}
        </div>
      </div>
    </div>
  );
};
