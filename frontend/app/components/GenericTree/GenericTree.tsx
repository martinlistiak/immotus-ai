import React, { useState, useRef, useEffect } from "react";
import cn from "classnames";
import { IoCaretDown, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Card } from "app/components/Card";

// DnD item types
export const ItemTypes = {
  TREE_NODE: "tree-node",
};

// DnD item structure
export interface DragItem {
  id: string;
  type: string;
  index: number;
  name: string;
}

export interface ContextMenuOption {
  label: string;
  onClick: () => void;
}

// Export as type for type-only imports
export type TreeNodeData = {
  id: string;
  name: string;
  children?: TreeNodeData[];
  type: string;
  parentId?: string | null;
  [key: string]: any; // Allow for additional properties
};

interface GenericTreeProps {
  nodes: TreeNodeData[];
  level?: number;
  // Core functionality
  onSelectNode?: (
    nodeId: string,
    multiSelect: boolean,
    rangeSelect: boolean
  ) => void;
  selectedNodeIds?: string[];
  // Hover state
  onHoverNode?: (nodeId: string) => void;
  onHoverExit?: (nodeId: string) => void;
  hoveredNodeId?: string | null;
  // Visibility
  hiddenNodeIds?: string[];
  onToggleVisibility?: (nodeId: string, isHidden: boolean) => void;
  // Drag and drop
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, beforeNodeId: string, parentId: string) => void;
  // Node editing
  onRenameNode?: (nodeId: string, newName: string) => void;
  editingNodeId?: string | null;
  setEditingNodeId?: (nodeId: string | null) => void;
  // Context menu
  getContextMenuOptions?: (nodeId: string) => ContextMenuOption[];
  // Customization
  renderIcon?: (node: TreeNodeData) => React.ReactNode;
  allowDragDrop?: boolean;
  allowContextMenu?: boolean;
  allowRenaming?: boolean;
}

const ContextMenu = ({
  options,
  onClose,
}: {
  options: ContextMenuOption[];
  onClose: () => void;
}) => {
  return (
    <Card className="absolute right-0 top-[26px] w-[160px] h-fit !bg-gray-900 !rounded-sm z-10 !text-xs text-gray-400 !p-2">
      <div className="flex flex-col">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className="cursor-pointer hover:bg-active hover:text-white rounded-md p-[10px] py-1"
          >
            <p>{option.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
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
  index,
  // Core functionality
  onSelectNode,
  selectedNodeIds = [],
  // Hover state
  onHoverNode,
  onHoverExit,
  hoveredNodeId,
  // Visibility
  hiddenNodeIds = [],
  onToggleVisibility,
  // Drag and drop
  onDragStart,
  onDragEnd,
  // Node editing
  onRenameNode,
  editingNodeId,
  setEditingNodeId,
  // Context menu
  getContextMenuOptions,
  // Customization
  renderIcon,
  allowDragDrop = true,
  allowContextMenu = true,
  allowRenaming = true,
}: {
  node: TreeNodeData;
  level: number;
  nodes: TreeNodeData[];
  index: number;
} & GenericTreeProps) => {
  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [dropPosition, setDropPosition] = useState<
    "before" | "inside" | "after" | null
  >(null);

  // Use a single ref for both the DOM element and drag/drop
  const ref = useRef<HTMLDivElement>(null);

  const isHovered = hoveredNodeId === node.id;
  const isSelected = selectedNodeIds.includes(node.id);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const nodeIndex = nodes.findIndex((n) => n.id === node.id);
  const isLastChild = nodeIndex === nodes.length - 1;
  const isHidden = hiddenNodeIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isGroup = node.type === "group" || node.type === "directory";

  // Set up drag
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TREE_NODE,
    item: (): DragItem => {
      onDragStart?.(node.id);
      return { id: node.id, type: node.type, index, name: node.name };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop() && onDragEnd) {
        onDragEnd(node.id, node.id, node.parentId || "");
      }
    },
    canDrag: () => allowDragDrop,
  });

  // Use empty image as drag preview (we'll handle custom preview elsewhere)
  useEffect(() => {
    if (allowDragDrop) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview, allowDragDrop]);

  // Set up drop
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TREE_NODE,
    hover: (item: DragItem, monitor) => {
      if (!allowDragDrop) return;

      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
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
        if (isGroup) {
          setDropPosition("inside");
        } else {
          setDropPosition("after");
        }
      }
    },
    drop: (item: DragItem, monitor) => {
      if (!allowDragDrop || !onDragEnd) return;

      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      if (!ref.current) {
        return;
      }

      // Don't allow dropping onto self
      if (item.id === node.id) {
        return;
      }

      // Calculate parent id based on drop position
      let parentId = "";
      let beforeId = "";

      if (dropPosition === "inside" && isGroup) {
        // If dropping inside a group, use the group's ID as parent
        parentId = node.id;
        // When dropping inside, place at the beginning of children
        beforeId =
          node.children && node.children.length > 0 ? node.children[0].id : "";
      } else if (dropPosition === "before") {
        // For before position, use the same parent as the current node
        parentId = node.parentId || "";
        beforeId = node.id;
      } else {
        // after
        // For after position, use the same parent as the current node
        parentId = node.parentId || "";
        // If this is the last child, we need special handling
        // to indicate the item should go at the end
        beforeId = isLastChild ? "" : nodes[nodeIndex + 1]?.id || "";
      }

      onDragEnd(item.id, beforeId, parentId);
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: () => allowDragDrop,
  });

  // Apply refs if drag and drop is allowed
  if (allowDragDrop) {
    drag(drop(ref));
  }

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!onSelectNode) return;

    onSelectNode(
      node.id,
      e.ctrlKey || e.metaKey, // multiSelect
      e.shiftKey // rangeSelect
    );
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (allowRenaming && setEditingNodeId) {
      setEditingNodeId(node.id);
    }
  };

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
        if (!allowContextMenu || !getContextMenuOptions) return;
        e.stopPropagation();
        e.preventDefault();
        if (!selectedNodeIds.includes(node.id) && onSelectNode) {
          onSelectNode(node.id, false, false);
        }
        setIsContextMenuOpen(true);
      }}
      onMouseLeave={() => {
        if (isContextMenuOpen) {
          setIsContextMenuOpen(false);
        }
      }}
    >
      {isOver && dropPosition === "before" && (
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-blue-500 z-20" />
      )}
      {(!isGroup || !isGroupOpen) && <HorizontalLine />}
      <div
        className={cn({
          "text-xs py-1 pr-3 pl-8 relative cursor-default flex items-center justify-between":
            true,
          "outline outline-active ": isHovered,
          "opacity-50": isHidden,
        })}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHoverNode?.(node.id);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHoverExit?.(node.id);
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center gap-2">
          {renderIcon ? renderIcon(node) : <div className="w-4 h-4" />}
          {editingNodeId === node.id ? (
            <input
              type="text"
              autoFocus
              className="w-full border bg-[rgba(255,255,255,0.3)] border-gray-300 rounded-sm h-[26px] outline-none -m-1 p-1"
              defaultValue={node.name}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onRenameNode && setEditingNodeId) {
                  setEditingNodeId(null);
                  onRenameNode(node.id, e.currentTarget.value);
                }
              }}
              onBlur={(e) => {
                if (onRenameNode && setEditingNodeId) {
                  setEditingNodeId(null);
                  onRenameNode(node.id, e.target.value);
                }
              }}
            />
          ) : (
            <div className="border border-transparent w-full -m-1 p-1 rounded-sm h-[26px] text-ellipsis overflow-hidden whitespace-nowrap">
              {node.name}
            </div>
          )}
        </div>
        {/* Visibility toggle buttons */}
        {onToggleVisibility && (
          <>
            {isHovered && !isHidden && (
              <IoEyeOutline
                className="w-[16px] h-[16px] hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(node.id, false);
                }}
              />
            )}
            {isHidden && (
              <IoEyeOffOutline
                className="w-[16px] h-[16px] hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(node.id, true);
                }}
              />
            )}
          </>
        )}
      </div>
      {isGroup && (
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
      {isContextMenuOpen && getContextMenuOptions && (
        <ContextMenu
          options={getContextMenuOptions(node.id)}
          onClose={() => setIsContextMenuOpen(false)}
        />
      )}
      <div
        className={cn({
          "relative left-[14px] w-[calc(100%-14px)]": true,
          hidden: !isGroupOpen,
        })}
      >
        {hasChildren &&
          node.children!.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              nodes={node.children!}
              level={level + 1}
              index={idx}
              // Pass all props down
              onSelectNode={onSelectNode}
              selectedNodeIds={selectedNodeIds}
              onHoverNode={onHoverNode}
              onHoverExit={onHoverExit}
              hoveredNodeId={hoveredNodeId}
              hiddenNodeIds={hiddenNodeIds}
              onToggleVisibility={onToggleVisibility}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onRenameNode={onRenameNode}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
              getContextMenuOptions={getContextMenuOptions}
              renderIcon={renderIcon}
              allowDragDrop={allowDragDrop}
              allowContextMenu={allowContextMenu}
              allowRenaming={allowRenaming}
            />
          ))}
      </div>
      {isOver && dropPosition === "after" && (
        <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-500 z-20" />
      )}
      {/* Inside indicator */}
      {isOver && dropPosition === "inside" && isGroup && (
        <div className="absolute left-[14px] right-0 top-[24px] h-[2px] bg-blue-500 z-20" />
      )}
      {!isGroup && <VerticalLine isLastChild={isLastChild} />}
    </div>
  );
};

export const GenericTree = ({
  nodes,
  level = 0,
  ...props
}: GenericTreeProps) => {
  return (
    <div className="flex flex-col relative">
      {nodes.map((node, index) => (
        <TreeNode
          key={node.id}
          node={node}
          nodes={nodes}
          level={level + 1}
          index={index}
          {...props}
        />
      ))}
    </div>
  );
};
