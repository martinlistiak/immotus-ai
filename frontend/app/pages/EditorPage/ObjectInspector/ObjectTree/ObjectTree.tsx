import { useSceneContext } from "../../Scene/Scene.context";
import cn from "classnames";
import type { ObjectType } from "app/types/scene-ast";
import {
  IoCaretDown,
  IoCubeOutline,
  IoEllipseOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import { RiShapesLine } from "react-icons/ri";

import { useState } from "react";
import { Card } from "app/components/Card";

const RightClickMenu = ({ onClose }: { onClose: () => void }) => {
  const { removeObject, dispatchScene, selectedObjects } = useSceneContext();

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
    <Card className="absolute right-0 top-full w-[160px] h-fit !bg-gray-900 !rounded-sm z-10 !text-xs text-gray-400 !p-2">
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
            for (const object of selectedObjects) {
              removeObject(object.id);
            }
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
};

const NodeIcon = ({ type }: { type: ObjectType }) => {
  switch (type) {
    case "box":
      return <IoCubeOutline className="w-[18px] h-[18px]" />;
    case "sphere":
      return <IoEllipseOutline className="w-[18px] h-[18px]" />;
    case "mesh":
      return <RiShapesLine className="w-[18px] h-[18px]" />;
    case "light":
      return <IoSunnyOutline className="w-[18px] h-[20px]" />;
  }
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

const TreeNode = ({
  node,
  level,
  nodes,
  onShiftSelect,
}: {
  node: TreeNodeType;
  level: number;
  nodes: TreeNodeType[];
  onShiftSelect: (objectId: string, nodes: TreeNodeType[]) => void;
}) => {
  const {
    onHoverObjectIn,
    onHoverObjectOut,
    hoveredObject,
    setSelectedObjects,
    setEditingObjectName,
    editingObjectName,
    dispatchScene,
    selectedObjects,
  } = useSceneContext();

  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const isHovered = hoveredObject?.id === node.id;
  const isSelected = selectedObjects.some((object) => object.id === node.id);
  const [isRightClickMenuOpen, setIsRightClickMenuOpen] = useState(false);

  const isLastChild =
    nodes.findIndex((n) => n.id === node.id) === nodes.length - 1;

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
  return (
    <div
      className={cn({
        "flex flex-col gap-x-2 relative hover:bg-gray-800": true,
        "bg-gray-800": isHovered,
        "!bg-active text-white": isSelected,
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
      {(node.type !== "group" || !isGroupOpen) && <HorizontalLine />}
      <div
        className={cn({
          "text-xs py-1 pr-2 pl-8 relative cursor-default flex items-center gap-2":
            true,
          "outline outline-active ": isHovered,
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
      <div
        className={cn({
          "relative left-[14px] w-[calc(100%-14px)]": true,
          hidden: !isGroupOpen,
        })}
      >
        {node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            nodes={node.children}
            level={level + 1}
            onShiftSelect={onShiftSelect}
          />
        ))}
      </div>
      {isRightClickMenuOpen && (
        <RightClickMenu onClose={() => setIsRightClickMenuOpen(false)} />
      )}
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
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          nodes={nodes}
          onShiftSelect={onShiftSelect}
          level={level + 1}
        />
      ))}
    </div>
  );
};
