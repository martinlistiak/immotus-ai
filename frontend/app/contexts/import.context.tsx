import { createContext, useRef, useState, useEffect, useContext } from "react";
import { DndProvider as ReactDndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSceneContext } from "app/pages/EditorPage/Scene/Scene.context";
import { useLibraryContext } from "./library.context";
import { v4 as uuidv4 } from "uuid";
import type { FileType } from "app/types/file";
import { FiUpload } from "react-icons/fi";

export interface ImportContextType {
  importFile: (file: File) => void;
  importLibraryFile: (fileId: number) => void;
  isDraggingFile: boolean;
}

export const ImportContext = createContext<ImportContextType>({
  importFile: () => {},
  importLibraryFile: () => {},
  isDraggingFile: false,
});

export const useImportContext = () => useContext(ImportContext);

const DropLayer = () => {
  const dropLayerRef = useRef<HTMLDivElement>(null);
  const { dispatchScene } = useSceneContext();
  const { uploadFiles } = useLibraryContext();
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [{ isOver }, drop] = useDrop<
    { file: File | null; libraryFileId?: number },
    void,
    { isOver: boolean }
  >({
    accept: ["file", "library-item"],
    hover: (item) => {
      // Just for debugging
      if (item.file) {
        console.log("Hovering with file:", item.file.name);
      } else if (item.libraryFileId) {
        console.log("Hovering with library item:", item.libraryFileId);
      }
    },
    drop: (item) => {
      if (item.file) {
        // Handle uploaded file
        const files = new DataTransfer();
        files.items.add(item.file);
        uploadFiles(files.files);
      } else if (item.libraryFileId) {
        // Handle library item being dropped to scene
        // We'll add it as an object in the scene
        addLibraryFileToScene(item.libraryFileId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Track when a file is dragged from the user's computer
  useEffect(() => {
    const handleWindowDragEnter = (event: DragEvent) => {
      event.preventDefault();

      // Only react to actual files being dragged
      if (event.dataTransfer?.types.includes("Files")) {
        setIsDraggingFile(true);
      }
    };

    const handleWindowDragLeave = (event: DragEvent) => {
      event.preventDefault();

      // Only handle drag leave when leaving to outside the window
      if (
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      ) {
        setIsDraggingFile(false);
      }
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
    };
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files.length > 0) {
      uploadFiles(event.dataTransfer.files);
    }

    setIsDraggingFile(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Only handle drag leave when leaving the drop area
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDraggingFile(false);
    }
  };

  // Function to add a library file to the scene
  const addLibraryFileToScene = (fileId: number) => {
    // Create an object based on the file and add it to the scene
    dispatchScene({
      type: "ADD_OBJECT",
      payload: {
        object: {
          id: uuidv4(),
          type: "box", // Use box as a fallback type that's easier to handle than mesh
          parentId: null,
          attributes: {
            name: `Library Item ${fileId}`,
            description: `Imported from library ID: ${fileId}`,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            material: {
              color: "#ffffff",
              roughness: 0.5,
              metalness: 0.5,
            },
          },
        },
      },
    });
  };

  drop(dropLayerRef);

  return (
    <div
      ref={dropLayerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: isDraggingFile || isOver ? 9999 : -1 }}
    >
      {(isDraggingFile || isOver) && (
        <div className="w-full h-full bg-[rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-auto">
          <div className="bg-gray-800 text-white px-8 py-6 rounded-lg border-2 border-blue-400 shadow-xl text-center transform transition-all duration-200 scale-110 animate-pulse">
            <div className="flex justify-center mb-3">
              <FiUpload className="text-blue-400 text-4xl" />
            </div>
            <p className="text-2xl font-bold text-blue-300">Drop Files Here</p>
            <p className="text-sm text-gray-300 mt-2">
              Files will be added to your library
            </p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Supported formats: GLB, GLTF, OBJ
              </p>
            </div>
          </div>
          <div className="absolute inset-0 border-4 border-dashed border-blue-400 m-8 rounded-xl opacity-60 pointer-events-none"></div>
        </div>
      )}
    </div>
  );
};

export const ImportContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { dispatchScene } = useSceneContext();
  const { uploadFiles } = useLibraryContext();
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Import a file directly (programmatically)
  const importFile = (file: File) => {
    if (!file) return;

    const files = new DataTransfer();
    files.items.add(file);
    uploadFiles(files.files);
  };

  // Import a library file to scene
  const importLibraryFile = (fileId: number) => {
    dispatchScene({
      type: "ADD_OBJECT",
      payload: {
        object: {
          id: uuidv4(),
          type: "box", // Use box as a fallback type that's easier to handle than mesh
          parentId: null,
          attributes: {
            name: `Library Item ${fileId}`,
            description: `Imported from library ID: ${fileId}`,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            material: {
              color: "#ffffff",
              roughness: 0.5,
              metalness: 0.5,
            },
          },
        },
      },
    });
  };

  return (
    <ReactDndProvider backend={HTML5Backend}>
      <ImportContext.Provider
        value={{
          importFile,
          importLibraryFile,
          isDraggingFile,
        }}
      >
        {children}
        <DropLayer />
      </ImportContext.Provider>
    </ReactDndProvider>
  );
};
