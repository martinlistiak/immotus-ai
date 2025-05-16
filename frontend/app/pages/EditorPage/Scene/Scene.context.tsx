import {
  getScene,
  getScenes,
  postScene,
  updateSceneObjects,
} from "app/api/scene";
import { useLocalStorageState } from "app/hooks/useLocalStorageState";
import {
  initialSceneObjects,
  useSceneReducer,
  type Action,
} from "app/reducers/scene-reducer";
import {
  type AbstractSyntaxTree,
  type SceneTool,
  type ObjectAttributes,
  CameraType,
  type SceneType,
} from "app/types/scene-ast";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

export const SceneContext = createContext({
  scene: null as SceneType | null,
  scenes: [] as SceneType[],
  selectedObjects: [] as AbstractSyntaxTree<ObjectAttributes>[],
  setSelectedObjects: (objectIds: string[]) => {},
  editingObjectName: null as string | null,
  setEditingObjectName: (objectId: string | null) => {},
  activeTool: "move" as SceneTool,
  setActiveTool: ((tool: SceneTool) => {}) as React.Dispatch<
    React.SetStateAction<SceneTool>
  >,
  removeObjects: (_objectIds: string[]) => {},
  dispatchScene: (_action: Action) => {},
  undo: () => {},
  redo: () => {},
  history: [] as SceneType[],
  historyIndex: 0,
  isSceneSelectionOpen: false,
  setIsSceneSelectionOpen: (_isOpen: boolean) => {},
  refetchScenes: () => {},
  activeCamera: null as CameraType | null,
  setActiveCamera: (_camera: CameraType) => {},
  hiddenObjectIds: [] as string[],
  setHiddenObjectIds: (_objectIds: string[]) => {},
});

export const SceneContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedObjects, setSelectedObjects] = useState<
    AbstractSyntaxTree<ObjectAttributes>[]
  >([]);
  const [editingObjectName, setEditingObjectName] = useState<string | null>(
    null
  );
  const [isSceneSelectionOpen, setIsSceneSelectionOpen] = useState(false);
  const [scene, dispatchUnwrapped] = useSceneReducer();
  const [activeTool, setActiveTool] = useState<SceneTool>("select");
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<SceneType[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hiddenObjectIds, setHiddenObjectIds] = useState<string[]>([]);
  const [activeCamera, setActiveCamera] = useState<CameraType | null>(
    CameraType.THREE_D
  );
  const [lastSceneUsed, setLastSceneUsed] = useLocalStorageState<string>(
    "lastSceneUsed",
    ""
  );
  const [scenes, setScenes] = useState<SceneType[]>([]);

  const sceneRef = useRef<SceneType | null>(null);
  sceneRef.current = scene;

  // this is for updating attributes in the attribute inspector when the scene is updated
  useEffect(() => {
    if (scene) {
      if (selectedObjects.length !== 0) {
        handleSetSelectedObjects(selectedObjects.map((object) => object.id));
      }
    }
  }, [scene]);

  useEffect(() => {
    if (lastSceneUsed) {
      setHistory([JSON.parse(JSON.stringify(scene!))]);
      setHistoryIndex(0);
    }
  }, [lastSceneUsed]);

  const dispatch = (action: Action, callback?: () => void) => {
    dispatchUnwrapped(action, (scene: SceneType) => {
      if (!action.skipHistory) {
        const slicedHistory = history.slice(0, historyIndex + 1);
        setHistory([...slicedHistory, JSON.parse(JSON.stringify(scene))]);
        setHistoryIndex(historyIndex + 1);
      }
      callback?.();
    });
  };

  useEffect(() => {
    const fetchScene = async () => {
      try {
        const startTime = Date.now();
        let res: SceneType;
        const scenes = await getScenes();
        setScenes(scenes);
        try {
          res = await getScene({ id: lastSceneUsed || scenes[0].id });
        } catch (error) {
          if (scenes.length > 0) {
            res = await getScene({ id: scenes[0].id });
            setLastSceneUsed(scenes[0].id);
          } else {
            const newScene = await postScene({
              name: "Untitled",
              objects: initialSceneObjects,
            });
            res = newScene;
            setLastSceneUsed(newScene.id);
          }
          console.error(error);
        }

        dispatch({
          type: "SET_SCENE",
          payload: { scene: res },
          skipHistory: true,
        });
        setHistory([JSON.parse(JSON.stringify(res!))]);
        // Ensure loading state shows for at least 500 ms
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 500 - elapsedTime);

        if (remainingTime > 0) {
          setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchScene();
  }, []);

  const handleSetSelectedObjects = useCallback((objectIds: string[]) => {
    const objects =
      sceneRef.current?.objects.filter((object) =>
        objectIds.includes(object.id)
      ) || [];

    setSelectedObjects(objects);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      dispatch(
        {
          type: "SET_SCENE",
          payload: { scene: history[historyIndex - 1] },
          skipHistory: true,
        },
        () => {
          handleSetSelectedObjects(selectedObjects.map((object) => object.id));
        }
      );
    }
  }, [
    historyIndex,
    history,
    dispatch,
    selectedObjects,
    handleSetSelectedObjects,
  ]);

  const redo = useCallback(() => {
    if (historyIndex === history.length - 1) {
      return;
    }
    setHistoryIndex(historyIndex + 1);
    dispatch(
      {
        type: "SET_SCENE",
        payload: { scene: history[historyIndex + 1] },
        skipHistory: true,
      },
      () => {
        handleSetSelectedObjects(selectedObjects.map((object) => object.id));
      }
    );
  }, [
    historyIndex,
    history,
    dispatch,
    selectedObjects,
    handleSetSelectedObjects,
  ]);

  const removeObjects = useCallback(
    (objectIds: string[]) => {
      if (selectedObjects.some((object) => objectIds.includes(object.id))) {
        setSelectedObjects(
          selectedObjects.filter((object) => !objectIds.includes(object.id))
        );
      }
      dispatch({ type: "REMOVE_OBJECTS", payload: { objectIds } });
    },
    [dispatch, selectedObjects]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (e.target instanceof HTMLInputElement) {
          return;
        }
        removeObjects(selectedObjects.map((object) => object.id));
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        redo();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scene, removeObjects, undo, redo]);

  useEffect(() => {
    if (scene && !isLoading) {
      updateSceneObjects({ id: scene.id, objects: scene.objects });
      setLastSceneUsed(scene.id.toString());
    }
  }, [scene, isLoading]);

  const refetchScenes = useCallback(async () => {
    try {
      const scenes = await getScenes();
      setScenes(scenes);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <SceneContext.Provider
      value={{
        scene,
        dispatchScene: dispatch,
        selectedObjects,
        setSelectedObjects: handleSetSelectedObjects,
        editingObjectName,
        setEditingObjectName,
        activeTool,
        setActiveTool,
        removeObjects,
        undo,
        redo,
        history,
        historyIndex,
        scenes,
        isSceneSelectionOpen,
        setIsSceneSelectionOpen,
        refetchScenes,
        activeCamera,
        setActiveCamera,
        hiddenObjectIds,
        setHiddenObjectIds,
      }}
    >
      {isLoading && (
        <div className="flex items-center justify-center h-[100vh] w-[100vw] z-100 fixed top-0 left-0 bg-[#2D2E32]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
      {children}
    </SceneContext.Provider>
  );
};

export const useSceneContext = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error(
      "useSceneContext must be used within a SceneContextProvider"
    );
  }
  return context;
};

export const SceneHoverContext = createContext({
  onHoverObjectIn: (objectId: string) => {},
  onHoverObjectOut: (objectId: string) => {},
  hoveredObject: null as AbstractSyntaxTree<ObjectAttributes> | null,
});

export const SceneHoverContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { scene } = useSceneContext();
  const [hoveredObject, setHoveredObject] =
    useState<AbstractSyntaxTree<ObjectAttributes> | null>(null);

  const onHoverObjectIn = (objectId: string) => {
    const object = scene?.objects.find((object) => object.id === objectId);
    if (object) {
      setHoveredObject(object);
    }
  };

  const onHoverObjectOut = (objectId: string) => {
    if (hoveredObject?.id === objectId) {
      setHoveredObject(null);
    }
  };

  return (
    <SceneHoverContext.Provider
      value={{ onHoverObjectIn, onHoverObjectOut, hoveredObject }}
    >
      {children}
    </SceneHoverContext.Provider>
  );
};

export const useSceneHoverContext = () => {
  const context = useContext(SceneHoverContext);
  if (!context) {
    throw new Error(
      "useSceneHoverContext must be used within a SceneHoverContextProvider"
    );
  }
  return context;
};

export const SceneDragAndDropContext = createContext({
  onDragStart: (_objectId: string) => {},
  onDragEnd: (
    _objectId: string,
    _nextInGroupIndex: string,
    _parentId: string
  ) => {},
  draggingObject: null as AbstractSyntaxTree<ObjectAttributes> | null,
});

export const SceneDragAndDropContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { scene, dispatchScene } = useSceneContext();
  const [draggingObject, setDraggingObject] =
    useState<AbstractSyntaxTree<ObjectAttributes> | null>(null);

  const onDragStart = (objectId: string) => {
    const object = scene?.objects.find((object) => object.id === objectId);
    if (object) {
      setDraggingObject(object);
    }
  };

  const onDragEnd = (
    objectId: string,
    nextInGroupId: string,
    parentId: string
  ) => {
    setDraggingObject(null);
    dispatchScene({
      type: "MOVE_OBJECT_IN_TREE",
      payload: { objectId, parentId, nextInGroupId },
    });
  };

  return (
    <SceneDragAndDropContext.Provider
      value={{ onDragStart, onDragEnd, draggingObject }}
    >
      {children}
    </SceneDragAndDropContext.Provider>
  );
};

export const useSceneDragAndDropContext = () => {
  const context = useContext(SceneDragAndDropContext);
  if (!context) {
    throw new Error(
      "useSceneDragAndDropContext must be used within a SceneDragAndDropContextProvider"
    );
  }
  return context;
};

export const SceneExportContext = createContext({
  exportScene: (_format: "glb" | "gltf" | "obj") => {},
  threeScene: null as THREE.Scene | null,
  setThreeScene: (_scene: THREE.Scene | null) => {},
});

export const SceneExportContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { scene } = useSceneContext();
  const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);
  const exportScene = (format: "glb" | "gltf" | "obj") => {
    if (!scene) return;

    // If we have a Three.js scene reference, use it directly instead of recreating
    if (threeScene) {
      Promise.all([
        import("three"),
        import("three/examples/jsm/exporters/GLTFExporter.js"),
        import("three/examples/jsm/exporters/OBJExporter.js"),
        import("three/examples/jsm/utils/SceneUtils.js"),
      ])
        .then(
          ([
            THREE,
            GLTFExporterModule,
            OBJExporterModule,
            SceneUtilsModule,
          ]) => {
            const { GLTFExporter } = GLTFExporterModule;
            const { OBJExporter } = OBJExporterModule;

            // Make a clone of the scene to avoid modifying the original
            const sceneToExport = new THREE.Scene();

            // Copy properties from the original scene
            sceneToExport.name = threeScene.name;
            sceneToExport.background = threeScene.background;

            // Filter out any helper objects, cameras, and controls that shouldn't be exported
            threeScene.children.forEach((child) => {
              // Keep only meshes, lights, and groups, filter out helpers, cameras, etc.
              const isExportable =
                child.type === "Mesh" ||
                child.type === "Group" ||
                child.type.includes("Light") ||
                // Include the actual scene object if it exists
                child.type === "Scene" ||
                child.name === scene.name;

              if (isExportable) {
                // Clone the object and add it to our export scene
                try {
                  // Create a deep clone of the object
                  const clonedObject = child.clone();

                  // Clone any meshes/materials recursively
                  if (child.type === "Mesh") {
                    const originalMesh = child as THREE.Mesh;
                    const clonedMesh = clonedObject as THREE.Mesh;

                    if (originalMesh.geometry) {
                      clonedMesh.geometry = originalMesh.geometry.clone();
                    }

                    if (originalMesh.material) {
                      if (Array.isArray(originalMesh.material)) {
                        clonedMesh.material = originalMesh.material.map((m) =>
                          m.clone()
                        );
                      } else {
                        clonedMesh.material = originalMesh.material.clone();
                      }
                    }
                  }

                  sceneToExport.add(clonedObject);
                } catch (error) {
                  console.error("Error cloning object:", error);
                }
              }
            });

            try {
              switch (format) {
                case "glb":
                case "gltf":
                  const gltfExporter = new GLTFExporter();
                  const gltfOptions = {
                    binary: format === "glb",
                    trs: true,
                    onlyVisible: true,
                  };

                  gltfExporter.parse(
                    sceneToExport,
                    (result) => {
                      let blob;

                      if (format === "glb") {
                        blob = new Blob([result as ArrayBuffer], {
                          type: "application/octet-stream",
                        });
                      } else {
                        blob = new Blob([JSON.stringify(result)], {
                          type: "application/json",
                        });
                      }

                      // Create download link
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `${scene.name}.${format}`;
                      link.click();

                      // Clean up
                      URL.revokeObjectURL(link.href);
                    },
                    (error) => {
                      console.error("Error exporting scene:", error);
                      // Fall back to the old method if direct export fails
                      fallbackExport(format);
                    },
                    gltfOptions
                  );
                  break;

                case "obj":
                  const objExporter = new OBJExporter();
                  const result = objExporter.parse(sceneToExport);

                  // Download as OBJ file
                  const blob = new Blob([result], { type: "text/plain" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `${scene.name}.obj`;
                  link.click();

                  // Clean up
                  URL.revokeObjectURL(link.href);
                  break;
              }
            } catch (err) {
              console.error(`Error exporting as ${format}:`, err);
              // Fall back to the old method if direct export fails
              fallbackExport(format);
            }
          }
        )
        .catch((err) => {
          console.error("Error loading exporters:", err);
          // Fall back to the old method if loading fails
          fallbackExport(format);
        });
    } else {
      // Use the original implementation as a fallback
      fallbackExport(format);
    }
  };

  // The original export implementation as a fallback
  const fallbackExport = (format: "glb" | "gltf" | "obj") => {
    if (!scene) return;

    // Dynamically import Three.js and exporters
    Promise.all([
      import("three"),
      import("three/examples/jsm/exporters/GLTFExporter.js"),
      import("three/examples/jsm/exporters/OBJExporter.js"),
    ])
      .then(([THREE, GLTFExporterModule, OBJExporterModule]) => {
        const { GLTFExporter } = GLTFExporterModule;
        const { OBJExporter } = OBJExporterModule;

        // Create a new Three.js scene
        const threeScene = new THREE.Scene();

        // Process all objects in our scene
        scene.objects.forEach((object) => {
          // Skip if no valid type
          if (!object.type || !object.attributes) return;

          try {
            let threeMesh;

            // Create appropriate Three.js objects based on our scene objects
            switch (object.type) {
              case "box":
                const boxGeometry = new THREE.BoxGeometry(
                  object.attributes.scale.x,
                  object.attributes.scale.y,
                  object.attributes.scale.z
                );
                const boxMaterial = new THREE.MeshStandardMaterial({
                  color:
                    (object.attributes as any).material?.color || "#ffffff",
                  roughness:
                    (object.attributes as any).material?.roughness || 0.5,
                  metalness:
                    (object.attributes as any).material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                break;

              case "sphere":
                const sphereAttr = object.attributes as any;
                const sphereGeometry = new THREE.SphereGeometry(
                  sphereAttr.radius || 1,
                  32,
                  16
                );
                const sphereMaterial = new THREE.MeshStandardMaterial({
                  color: sphereAttr.material?.color || "#ffffff",
                  roughness: sphereAttr.material?.roughness || 0.5,
                  metalness: sphereAttr.material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                break;

              case "plane":
                const planeAttr = object.attributes as any;
                const planeGeometry = new THREE.PlaneGeometry(
                  planeAttr.width || 1,
                  planeAttr.height || 1
                );
                const planeMaterial = new THREE.MeshStandardMaterial({
                  color: planeAttr.material?.color || "#ffffff",
                  roughness: planeAttr.material?.roughness || 0.5,
                  metalness: planeAttr.material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                break;

              case "cylinder":
                const cylinderAttr = object.attributes as any;
                const cylinderGeometry = new THREE.CylinderGeometry(
                  cylinderAttr.radiusTop || 1,
                  cylinderAttr.radiusBottom || 1,
                  cylinderAttr.height || 1,
                  cylinderAttr.radialSegments || 32
                );
                const cylinderMaterial = new THREE.MeshStandardMaterial({
                  color: cylinderAttr.material?.color || "#ffffff",
                  roughness: cylinderAttr.material?.roughness || 0.5,
                  metalness: cylinderAttr.material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                break;

              case "cone":
                const coneAttr = object.attributes as any;
                const coneGeometry = new THREE.ConeGeometry(
                  coneAttr.radius || 1,
                  coneAttr.height || 1,
                  coneAttr.radialSegments || 32
                );
                const coneMaterial = new THREE.MeshStandardMaterial({
                  color: coneAttr.material?.color || "#ffffff",
                  roughness: coneAttr.material?.roughness || 0.5,
                  metalness: coneAttr.material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(coneGeometry, coneMaterial);
                break;

              case "torus":
                const torusAttr = object.attributes as any;
                const torusGeometry = new THREE.TorusGeometry(
                  torusAttr.radius || 1,
                  torusAttr.tube || 0.4,
                  torusAttr.radialSegments || 16,
                  torusAttr.tubularSegments || 32
                );
                const torusMaterial = new THREE.MeshStandardMaterial({
                  color: torusAttr.material?.color || "#ffffff",
                  roughness: torusAttr.material?.roughness || 0.5,
                  metalness: torusAttr.material?.metalness || 0.2,
                });
                threeMesh = new THREE.Mesh(torusGeometry, torusMaterial);
                break;

              case "light":
                const lightAttr = object.attributes as any;
                threeMesh = new THREE.PointLight(
                  lightAttr.color || "#ffffff",
                  lightAttr.intensity || 1,
                  lightAttr.distance || 0,
                  lightAttr.decay || 2
                );
                break;

              default:
                // Skip unknown types
                return;
            }

            if (threeMesh) {
              // Set common properties
              threeMesh.position.set(
                object.attributes.position.x,
                object.attributes.position.y,
                object.attributes.position.z
              );
              threeMesh.rotation.set(
                object.attributes.rotation.x,
                object.attributes.rotation.y,
                object.attributes.rotation.z
              );

              // Only set scale for non-light objects
              if (object.type !== "light") {
                threeMesh.scale.set(
                  object.attributes.scale.x,
                  object.attributes.scale.y,
                  object.attributes.scale.z
                );
              }

              // Set name
              threeMesh.name =
                object.attributes.name || `${object.type}_${object.id}`;

              // Add to scene
              threeScene.add(threeMesh);
            }
          } catch (err) {
            console.error(`Error processing object ${object.id}:`, err);
          }
        });

        // Handle export based on format
        try {
          switch (format) {
            case "glb":
            case "gltf":
              const gltfExporter = new GLTFExporter();
              const gltfOptions = {
                binary: format === "glb",
                trs: true,
                onlyVisible: true,
              };

              gltfExporter.parse(
                threeScene,
                (result) => {
                  let blob;

                  if (format === "glb") {
                    blob = new Blob([result as ArrayBuffer], {
                      type: "application/octet-stream",
                    });
                  } else {
                    blob = new Blob([JSON.stringify(result)], {
                      type: "application/json",
                    });
                  }

                  // Create download link
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `${scene.name}.${format}`;
                  link.click();

                  // Clean up
                  URL.revokeObjectURL(link.href);
                },
                (error) => {
                  console.error("Error exporting scene:", error);
                },
                gltfOptions
              );
              break;

            case "obj":
              const objExporter = new OBJExporter();
              const result = objExporter.parse(threeScene);

              // Download as OBJ file
              const blob = new Blob([result], { type: "text/plain" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `${scene.name}.obj`;
              link.click();

              // Clean up
              URL.revokeObjectURL(link.href);
              break;
          }
        } catch (err) {
          console.error(`Error exporting as ${format}:`, err);
        }
      })
      .catch((err) => {
        console.error("Error loading exporters:", err);
      });
  };

  return (
    <SceneExportContext.Provider
      value={{ exportScene, threeScene, setThreeScene }}
    >
      {children}
    </SceneExportContext.Provider>
  );
};

export const useSceneExportContext = () => {
  const context = useContext(SceneExportContext);
  if (!context) {
    throw new Error(
      "useSceneExportContext must be used within a SceneExportContextProvider"
    );
  }
  return context;
};
