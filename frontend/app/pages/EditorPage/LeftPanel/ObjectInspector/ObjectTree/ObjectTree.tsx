import {
  useSceneContext,
  useSceneHoverContext,
  useSceneDragAndDropContext,
} from "../../../Scene/Scene.context";
import type { ObjectType } from "app/types/scene-ast";
import { useEffect, useState, useRef } from "react";
import { NodeIcon } from "app/components/NodeIcon";
import { GenericTree } from "app/components/GenericTree/GenericTree";
import type { TreeNodeData } from "app/components/GenericTree/GenericTree";
import { GenericDragLayer } from "app/components/GenericTree/DragLayer";

export type TreeNodeType = {
  id: string;
  name: string;
  children: TreeNodeType[];
  type: ObjectType;
  parentId?: string | null;
};

export const ObjectTree = ({
  nodes,
  level = 0,
}: {
  nodes: TreeNodeType[];
  level: number;
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
  const copiedObjectsRef = useRef<string[]>([]);

  // Convert TreeNodeType to GenericTree's TreeNodeData
  const convertToTreeNodeData = (nodes: TreeNodeType[]): TreeNodeData[] => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      parentId: node.parentId,
      children:
        node.children.length > 0
          ? convertToTreeNodeData(node.children)
          : undefined,
      // Store original node data for reference
      _original: node,
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy selected objects (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        copiedObjectsRef.current = selectedObjects.map((object) => object.id);
      }

      // Paste/duplicate copied objects (Ctrl+V or Cmd+V)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "v" &&
        copiedObjectsRef.current.length > 0
      ) {
        dispatchScene({
          type: "DUPLICATE_OBJECTS",
          payload: { objectIds: copiedObjectsRef.current },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjects, dispatchScene]);

  const treeData = convertToTreeNodeData(nodes);

  // Handle selection
  const handleSelectNode = (
    nodeId: string,
    multiSelect: boolean,
    rangeSelect: boolean
  ) => {
    if (multiSelect) {
      // Add to selection
      setSelectedObjects([
        ...selectedObjects.map((object) => object.id),
        nodeId,
      ]);
    } else if (rangeSelect) {
      // Find nodes between the first selected node and this one
      const flatNodes = flattenNodes(nodes);
      const selectedNodeIndex = flatNodes.findIndex(
        (node) => node.id === nodeId
      );
      const [maxSelectedIndex, minSelectedIndex] = flatNodes.reduce(
        (acc, node, i) => {
          if (selectedObjects.find((o) => o.id === node.id)) {
            return [Math.max(acc[0], i), Math.min(acc[1], i)];
          }
          return acc;
        },
        [selectedNodeIndex, selectedNodeIndex]
      );

      const nodesInBetween = flatNodes.slice(
        minSelectedIndex,
        maxSelectedIndex + 1
      );
      setSelectedObjects([...nodesInBetween.map((node) => node.id)]);
    } else {
      // Simple selection
      setSelectedObjects(
        selectedObjects.find((o) => o.id === nodeId) ? [] : [nodeId]
      );
    }
  };

  // Helper to flatten the tree nodes
  const flattenNodes = (nodes: TreeNodeType[]): TreeNodeType[] => {
    return nodes.reduce((acc, node) => {
      acc.push(node);
      if (node.children && node.children.length > 0) {
        acc.push(...flattenNodes(node.children));
      }
      return acc;
    }, [] as TreeNodeType[]);
  };

  // Get context menu options
  const getContextMenuOptions = (nodeId: string) => {
    return [
      {
        label: "Duplicate",
        onClick: () => {
          dispatchScene({
            type: "DUPLICATE_OBJECTS",
            payload: { objectIds: selectedObjects.map((o) => o.id) },
          });
        },
      },
      {
        label: "Group Selection",
        onClick: () => {
          dispatchScene({
            type: "GROUP_OBJECTS",
            payload: { objectIds: selectedObjects.map((o) => o.id) },
          });
        },
      },
      {
        label: "Delete",
        onClick: () => {
          removeObjects(selectedObjects.map((o) => o.id));
        },
      },
    ];
  };

  // Toggle visibility
  const handleToggleVisibility = (nodeId: string, isHidden: boolean) => {
    if (isHidden) {
      setHiddenObjectIds(hiddenObjectIds.filter((id) => id !== nodeId));
    } else {
      setHiddenObjectIds([...hiddenObjectIds, nodeId]);
    }
  };

  // Handle rename
  const handleRenameNode = (nodeId: string, newName: string) => {
    dispatchScene({
      type: "RENAME_OBJECT",
      payload: { objectId: nodeId, name: newName },
    });
  };

  // Handle drag and drop
  const handleTreeDragStart = (nodeId: string) => {
    onDragStart(nodeId);
  };

  const handleTreeDragEnd = (
    nodeId: string,
    beforeNodeId: string,
    parentId: string
  ) => {
    console.log(
      `Moving ${nodeId} before ${beforeNodeId} under parent ${parentId}`
    );

    // If beforeNodeId is empty, this item should go at the end of its parent's children
    const targetBeforeId = beforeNodeId || "";

    // Call the scene context's drag end handler
    onDragEnd(nodeId, targetBeforeId, parentId);
  };

  // Custom icon renderer
  const renderIcon = (node: TreeNodeData) => {
    return <NodeIcon type={node.type as ObjectType} />;
  };

  // Helper function to remove objects
  const removeObjects = (objectIds: string[]) => {
    setSelectedObjects([]);
    dispatchScene({
      type: "REMOVE_OBJECTS",
      payload: { objectIds },
    });
  };

  return (
    <>
      <GenericTree
        nodes={treeData}
        level={level}
        selectedNodeIds={selectedObjects.map((o) => o.id)}
        onSelectNode={handleSelectNode}
        hoveredNodeId={hoveredObject?.id || null}
        onHoverNode={onHoverObjectIn}
        onHoverExit={onHoverObjectOut}
        hiddenNodeIds={hiddenObjectIds}
        onToggleVisibility={handleToggleVisibility}
        onDragStart={handleTreeDragStart}
        onDragEnd={handleTreeDragEnd}
        onRenameNode={handleRenameNode}
        editingNodeId={editingObjectName}
        setEditingNodeId={setEditingObjectName}
        getContextMenuOptions={getContextMenuOptions}
        renderIcon={renderIcon}
        allowDragDrop={true}
        allowContextMenu={true}
        allowRenaming={true}
      />
      <GenericDragLayer
        renderIcon={(type) => <NodeIcon type={type as ObjectType} />}
      />
    </>
  );
};
