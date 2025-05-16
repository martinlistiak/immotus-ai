import { useRef, useState } from "react";
import {
  FiDownload,
  FiTrash,
  FiUpload,
  FiFolder,
  FiFile,
} from "react-icons/fi";
import { Spinner } from "app/components/Spinner";
import { useLibraryContext } from "app/contexts/library.context";
import type { FileType } from "app/types/file";
import { GenericTree } from "app/components/GenericTree/GenericTree";
import type { TreeNodeData } from "app/components/GenericTree/GenericTree";
import type { ObjectType } from "app/types/scene-ast";
import cn from "classnames";
import { GenericDragLayer } from "app/components/GenericTree/DragLayer";
import { useSceneContext } from "app/pages/EditorPage/Scene/Scene.context";
import { importGltf } from "app/utils/importers";

// Create a custom icon component for library files
const LibraryIcon = ({ type }: { type: string }) => {
  if (type === "directory") {
    return <FiFolder className="w-[18px] h-[18px] text-gray-400" />;
  } else {
    return <FiFile className="w-[18px] h-[18px] text-gray-400" />;
  }
};

export const Library = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const {
    isLoadingFiles,
    isLoadingStructure,
    deleteFile,
    uploadFiles,
    files,
    isUploadingFiles,
  } = useLibraryContext();
  console.log(files);

  const { dispatchScene } = useSceneContext();

  // Handle download
  const handleDownload = (fileId: number, fileName: string) => {
    window.open(`/file/download/${fileId}`, "_blank");
  };

  // Convert FileType[] to TreeNodeData[]
  const convertToTreeData = (
    items: FileType[],
    parentId?: string
  ): TreeNodeData[] => {
    return items.map((item) => {
      const id = item.id ? item.id.toString() : item.name;

      return {
        id,
        name: item.name,
        type: item.type,
        parentId: parentId,
        size: item.size,
        // Add original item for reference
        _original: item,
        // Recursively convert children if present
        children: [],
      };
    });
  };

  // Convert folder structure to tree data
  const treeData = files ? convertToTreeData(files) : [];

  // Handle node selection
  const handleSelectNode = (
    nodeId: string,
    multiSelect: boolean,
    rangeSelect: boolean
  ) => {
    if (multiSelect) {
      // Toggle selection for the clicked node
      if (selectedNodeIds.includes(nodeId)) {
        setSelectedNodeIds(selectedNodeIds.filter((id) => id !== nodeId));
      } else {
        setSelectedNodeIds([...selectedNodeIds, nodeId]);
      }
    } else if (rangeSelect && selectedNodeIds.length > 0) {
      // Find the first selected node and implement range selection
      // This is a simplified version - a more complete implementation would
      // require knowledge of the entire flat node array
      setSelectedNodeIds([...selectedNodeIds, nodeId]);
    } else {
      // Single selection
      setSelectedNodeIds([nodeId]);
    }
  };

  // Context menu options
  const getContextMenuOptions = (nodeId: string) => {
    const nodeData = findNodeById(treeData, nodeId);
    if (!nodeData || nodeData.type === "directory") return [];

    return [
      {
        label: "Download",
        onClick: () => {
          if (nodeData && nodeData.id && !isNaN(Number(nodeData.id))) {
            handleDownload(Number(nodeData.id), nodeData.name);
          }
        },
      },
      {
        label: "Delete",
        onClick: () => {
          if (nodeData && nodeData.id && !isNaN(Number(nodeData.id))) {
            deleteFile(Number(nodeData.id));
          }
        },
      },
    ];
  };

  // Helper function to find a node by ID
  const findNodeById = (
    nodes: TreeNodeData[],
    nodeId: string
  ): TreeNodeData | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  // Render custom icon for node
  const renderIcon = (node: TreeNodeData) => {
    return <LibraryIcon type={node.type} />;
  };

  // Handle drag and drop
  const handleDragStart = (nodeId: string) => {
    // Set the currently dragged node
    setHoveredNodeId(nodeId);
  };

  // Determine if a file can be imported based on its extension
  const canImportFile = (nodeData: TreeNodeData | null): boolean => {
    if (!nodeData || nodeData.type === "directory") return false;

    const extension = nodeData.name.split(".").pop();

    // Check if it's a supported format (currently only GLTF)
    return extension === "gltf" || extension === "glb";
  };

  const handleDragEnd = async (
    nodeId: string,
    beforeNodeId: string,
    newParentId: string
  ) => {
    console.log(`Attempting to import file ${nodeId} from library to scene`);

    // Find the node data
    const nodeData = findNodeById(treeData, nodeId);
    if (!canImportFile(nodeData)) {
      console.log("File cannot be imported - unsupported format");
      setHoveredNodeId(null);
      return;
    }

    try {
      // Get the file information
      console.log(nodeData);
      const fileId = Number(nodeData!.id);
      if (isNaN(fileId)) {
        throw new Error("Invalid file ID");
      }

      // Construct the file URL
      const fileUrl = `${import.meta.env.VITE_API_URL}/file/download/${fileId}`;

      // Import the file based on its type
      const importedObjects = await importGltf(fileUrl);

      // console.log(importedObjects);

      // Add the imported objects to the scene
      importedObjects.forEach((object) => {
        dispatchScene({
          type: "ADD_OBJECT",
          payload: { object },
        });
      });

      console.log(
        `Successfully imported ${importedObjects.length} objects to the scene`
      );
    } catch (error) {
      console.error("Error importing file:", error);
    } finally {
      setHoveredNodeId(null);
    }
  };

  if (isLoadingFiles || isLoadingStructure) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-2 pb-2 flex flex-col h-full">
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingFiles}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-sm px-2 py-2 text-xs flex items-center justify-center cursor-pointer transition-all duration-100"
        >
          {isUploadingFiles ? (
            <Spinner size="sm" />
          ) : (
            <div className="flex items-center text-xs text-gray-300">
              <FiUpload className="mr-1" size={12} />
              <span>Upload Files</span>
            </div>
          )}
        </button>
      </div>

      {/* <div className="text-sm font-medium mb-2 px-2 text-gray-300">Files</div> */}
      <div className="flex-1 overflow-auto">
        {treeData.length > 0 ? (
          <>
            <GenericTree
              nodes={treeData}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={handleSelectNode}
              hoveredNodeId={hoveredNodeId}
              onHoverNode={(id) => setHoveredNodeId(id)}
              onHoverExit={() => setHoveredNodeId(null)}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
              getContextMenuOptions={getContextMenuOptions}
              renderIcon={renderIcon}
              allowDragDrop={true}
              allowRenaming={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
            <GenericDragLayer
              renderIcon={(type) => <LibraryIcon type={type} />}
            />
          </>
        ) : (
          <div className="text-xs text-gray-400 p-2">No files found</div>
        )}
      </div>
    </div>
  );
};
