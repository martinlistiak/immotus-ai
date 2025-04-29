import {
  useSceneContext,
  useSceneHoverContext,
  useSceneDragAndDropContext,
} from "../../../Scene/Scene.context";
import cn from "classnames";
import type { ObjectType } from "app/types/scene-ast";
import { IoCaretDown, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import { Card } from "app/components/Card";
import { NodeIcon } from "app/components/NodeIcon";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

// DnD item types
const ItemTypes = {
  TREE_NODE: "tree-node",
};

// DnD item structure
interface DragItem {
  id: string;
  type: ObjectType;
  index: number;
  name: string;
}

const RightClickMenu = ({ onClose }: { onClose: () => void }) => {
  const { removeObjects, dispatchScene, selectedObjects } = useSceneContext();

  const handleDuplicate = () => {
    for (const object of selectedObjects) {
      dispatchScene({
        type: "DUPLICATE_OBJECT",
        payload: { objectId: object.id },
      });
    }
    onClose();
  };

  const groupObjects = () => {
    dispatchScene({
      type: "GROUP_OBJECTS",
      payload: { objectIds: selectedObjects.map((o) => o.id) },
    });
    onClose();
  };

  return (
    <Card className="absolute right-0 top-[26px] w-[160px] h-fit !bg-gray-900 !rounded-sm z-10 !text-xs text-gray-400 !p-2">
      <div className="flex flex-col">
        <div
          onClick={() => {
            handleDuplicate();
          }}
          className="cursor-pointer hover:bg-active hover:text-white rounded-md p-[10px] py-1"
        >
          <p>Duplicate</p>
        </div>

        <div
          onClick={() => {
            groupObjects();
          }}
          className="cursor-pointer hover:bg-active hover:text-white rounded-md p-[10px] py-1"
        >
          <p>Group Selection</p>
        </div>
        <div
          onClick={() => {
            removeObjects(selectedObjects.map((o) => o.id));
            onClose();
          }}
          className="cursor-pointer hover:bg-active hover:text-white rounded-md p-[10px] py-1"
        >
          <p>Delete</p>
        </div>
      </div>
    </Card>
  );
};

export type TreeNodeType = {
  id: string;
  name: string;
  children: TreeNodeType[];
  type: ObjectType;
  parentId?: string | null;
};

const VerticalLine = ({ isLastChild }: { isLastChild: boolean }) => {
  return (
    <div
      className={cn({
        "z-10 absolute left-[13px] top-0 w-[1px] h-full bg-gray-400": true,
        "!h-[calc(100%-13px)]": isLastChild,
      })}
    />
  );
};

const HorizontalLine = () => {
  return (
    <div className="absolute left-[14px] top-[50%] translate-y-[-50%] w-[8px] h-[1px] bg-gray-400" />
  );
};

// Drop position indicator
const DropIndicator = () => {
  return <div className="absolute left-0 right-0 h-[2px] bg-blue-500 z-20" />;
};

const TreeNode = ({
  node,
  level,
  nodes,
  onShiftSelect,
  index,
}: {
  node: TreeNodeType;
  level: number;
  nodes: TreeNodeType[];
  onShiftSelect: (objectId: string, nodes: TreeNodeType[]) => void;
  index: number;
}) => {
  const {
    setSelectedObjects,
    setEditingObjectName,
    editingObjectName,
    dispatchScene,
    selectedObjects,
    hiddenObjectIds,
    setHiddenObjectIds,
  } = useSceneContext();
  const { onHoverObjectIn, onHoverObjectOut, hoveredObject } =
    useSceneHoverContext();
  const { onDragStart, onDragEnd, draggingObject } =
    useSceneDragAndDropContext();

  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [dropPosition, setDropPosition] = useState<
    "before" | "inside" | "after" | null
  >(null);
  const ref = useRef<HTMLDivElement>(null);

  const isHovered = hoveredObject?.id === node.id;
  const isSelected = selectedObjects.some((object) => object.id === node.id);
  const [isRightClickMenuOpen, setIsRightClickMenuOpen] = useState(false);

  const isLastChild =
    nodes.findIndex((n) => n.id === node.id) === nodes.length - 1;

  // Set up drag
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TREE_NODE,
    item: (): DragItem => {
      onDragStart(node.id);
      return { id: node.id, type: node.type, index, name: node.name };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDragEnd(node.id, "");
      }
    },
  });

  // Use empty image as drag preview (we'll handle custom preview elsewhere)
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Set up drop
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TREE_NODE,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }

      // Don't allow dropping onto self
      if (item.id === node.id) {
        setDropPosition(null);
        return;
      }

      // Get the position of the cursor
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Determine drop position
      if (hoverClientY < hoverMiddleY * 0.5) {
        setDropPosition("before");
      } else if (hoverClientY > hoverMiddleY * 1.5) {
        setDropPosition("after");
      } else {
        // Only allow dropping inside groups
        if (node.type === "group") {
          setDropPosition("inside");
        } else {
          setDropPosition("after");
        }
      }
    },
    drop: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }

      // Don't allow dropping onto self
      if (item.id === node.id) {
        return;
      }

      // Calculate parent id based on drop position
      let parentId = "";

      if (dropPosition === "inside" && node.type === "group") {
        // If dropping inside a group, use the group's ID as parent
        parentId = node.id;
      } else {
        // For before/after positions, use the same parent as the current node
        // This keeps the item at the same level in the hierarchy
        parentId = node.parentId || "";
      }

      onDragEnd(item.id, parentId);
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Apply refs
  drag(drop(ref));

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // if (is holding shift)
    if (e.shiftKey) {
      onShiftSelect(node.id, nodes);
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedObjects([
        ...selectedObjects.map((object) => object.id),
        node.id,
      ]);
    } else {
      setSelectedObjects(
        selectedObjects.find((o) => o.id === node.id) ? [] : [node.id]
      );
    }
  };
  const isHidden = hiddenObjectIds.includes(node.id);
  return (
    <div
      ref={ref}
      className={cn({
        "flex flex-col gap-x-2 relative hover:bg-gray-800": true,
        "bg-gray-800": isHovered,
        "!bg-active text-white": isSelected,
        "opacity-50": isDragging,
      })}
      onClick={onClick}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (selectedObjects.find((o) => o.id === node.id)) {
          setIsRightClickMenuOpen(true);
        } else {
          setSelectedObjects([node.id]);
          setIsRightClickMenuOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (isRightClickMenuOpen) {
          setIsRightClickMenuOpen(false);
        }
      }}
    >
      {isOver && dropPosition === "before" && <DropIndicator />}
      {(node.type !== "group" || !isGroupOpen) && <HorizontalLine />}
      <div
        className={cn({
          "text-xs py-1 pr-3 pl-8 relative cursor-default flex items-center justify-between":
            true,
          "outline outline-active ": isHovered,
          "opacity-50": isHidden,
        })}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHoverObjectIn(node.id);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHoverObjectOut(node.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingObjectName(node.id);
        }}
      >
        <div className="flex items-center gap-2">
          <NodeIcon type={node.type} />
          {editingObjectName === node.id ? (
            <input
              type="text"
              autoFocus
              className="w-full border bg-[rgba(255,255,255,0.3)] border-gray-300 rounded-sm h-[26px] outline-none -m-1 p-1"
              defaultValue={node.name}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingObjectName(null);
                  dispatchScene({
                    type: "RENAME_OBJECT",
                    payload: { objectId: node.id, name: e.currentTarget.value },
                  });
                }
              }}
              onBlur={(e) => {
                setEditingObjectName(null);
                dispatchScene({
                  type: "RENAME_OBJECT",
                  payload: { objectId: node.id, name: e.target.value },
                });
              }}
            />
          ) : (
            <div className="border border-transparent w-full -m-1 p-1 rounded-sm h-[26px] text-ellipsis overflow-hidden whitespace-nowrap">
              {node.name}
            </div>
          )}
        </div>
        {isHovered && !isHidden && (
          <IoEyeOutline
            className="w-[16px] h-[16px] hover:text-gray-300"
            onClick={() => {
              // const childrenIds = findChildrenRecursively(
              //   scene?.objects || [],
              //   node.id
              // ).map((c) => c.id);
              setHiddenObjectIds([...hiddenObjectIds, node.id]);
            }}
          />
        )}
        {isHidden && (
          <IoEyeOffOutline
            className="w-[16px] h-[16px] hover:text-gray-300"
            onClick={() => {
              // const childrenIds = findChildrenRecursively(
              //   scene?.objects || [],
              //   node.id
              // ).map((c) => c.id);
              setHiddenObjectIds(
                hiddenObjectIds.filter((id) => id !== node.id)
              );
            }}
          />
        )}
      </div>
      {node.type === "group" && (
        <div
          className={cn({
            "absolute left-[5px] top-[4px] w-[18px] h-[18px] border border-gray-400 rounded-sm flex items-center justify-center bg-[#131418] outline-2 outline-[#131418] z-10 cursor-pointer":
              true,
            "rotate-180": !isGroupOpen,
          })}
          onClick={() => {
            setIsGroupOpen(!isGroupOpen);
          }}
        >
          <IoCaretDown className="w-[12px] h-[12px]" />
        </div>
      )}
      {isRightClickMenuOpen && (
        <RightClickMenu onClose={() => setIsRightClickMenuOpen(false)} />
      )}
      <div
        className={cn({
          "relative left-[14px] w-[calc(100%-14px)]": true,
          hidden: !isGroupOpen,
        })}
      >
        {node.children.map((child, idx) => (
          <TreeNode
            key={child.id}
            node={child}
            nodes={node.children}
            level={level + 1}
            onShiftSelect={onShiftSelect}
            index={idx}
          />
        ))}
      </div>
      {isOver && dropPosition === "after" && <DropIndicator />}
      {node.type !== "group" && <VerticalLine isLastChild={isLastChild} />}
    </div>
  );
};

export const ObjectTree = ({
  nodes,
  level = 0,
}: {
  nodes: TreeNodeType[];
  level: number;
}) => {
  const { setSelectedObjects, selectedObjects } = useSceneContext();
  const onShiftSelect = (objectId: string, nodes: TreeNodeType[]) => {
    const selectedObjectIndex = nodes.findIndex((node) => node.id === objectId);
    const [maxSelectedIndex, minSelectedIndex] = nodes.reduce(
      (acc, node, i) => {
        if (selectedObjects.find((o) => o.id === node.id)) {
          return [Math.max(acc[0], i), Math.min(acc[1], i)];
        }
        return acc;
      },
      [selectedObjectIndex, selectedObjectIndex]
    );

    const nodesInBetween = nodes.slice(minSelectedIndex, maxSelectedIndex + 1);
    setSelectedObjects([...nodesInBetween.map((node) => node.id)]);
  };

  return (
    <div className="flex flex-col relative">
      {nodes.map((node, index) => (
        <TreeNode
          key={node.id}
          node={node}
          nodes={nodes}
          onShiftSelect={onShiftSelect}
          level={level + 1}
          index={index}
        />
      ))}
    </div>
  );
};
