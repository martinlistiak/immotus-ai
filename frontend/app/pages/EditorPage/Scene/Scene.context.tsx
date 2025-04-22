import { getScene, getScenes, postScene } from "app/api/scene";
import { useLocalStorageState } from "app/hooks/useLocalStorageState";
import {
  initialScene,
  useSceneReducer,
  type Action,
} from "app/reducers/scene-reducer";
import type {
  AbstractSyntaxTree,
  SceneType,
  SceneTool,
  ObjectAttributes,
} from "app/types/scene-ast";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const SceneContext = createContext({
  scene: null as SceneType | null,
  scenes: [] as { name: string; scene: SceneType }[],
  selectedObjects: [] as AbstractSyntaxTree<ObjectAttributes>[],
  setSelectedObjects: (objectIds: string[]) => {},
  onHoverObjectIn: (objectId: string) => {},
  onHoverObjectOut: (objectId: string) => {},
  hoveredObject: null as AbstractSyntaxTree<ObjectAttributes> | null,
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
});

export const SceneContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedObjects, setSelectedObjects] = useState<
    AbstractSyntaxTree<ObjectAttributes>[]
  >([]);
  const [hoveredObject, setHoveredObject] =
    useState<AbstractSyntaxTree<ObjectAttributes> | null>(null);
  const [editingObjectName, setEditingObjectName] = useState<string | null>(
    null
  );
  const [isSceneSelectionOpen, setIsSceneSelectionOpen] = useState(false);
  const [scene, dispatchUnwrapped] = useSceneReducer();
  const [activeTool, setActiveTool] = useState<SceneTool>("move");
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<SceneType[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSceneUsed, setLastSceneUsed] = useLocalStorageState<string>(
    "lastSceneUsed",
    ""
  );
  const [scenes, setScenes] = useState<{ name: string; scene: SceneType }[]>(
    []
  );

  const sceneRef = useRef<SceneType | null>(null);
  sceneRef.current = scene;

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
          res = await getScene({ name: lastSceneUsed });
        } catch (error) {
          if (scenes.length > 0) {
            res = await getScene({ name: scenes[0].name });
            setLastSceneUsed(scenes[0].name);
          }
          console.error(error);
        }

        dispatch({
          type: "SET_SCENE",
          // @ts-ignore
          payload: { scene: res || initialScene },
          skipHistory: true,
        });
        setHistory([JSON.parse(JSON.stringify(res! || initialScene))]);
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
      postScene({ name: scene.name, scene: scene });
      setLastSceneUsed(scene.name);
    }
  }, [scene, isLoading]);

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
    <SceneContext.Provider
      value={{
        scene,
        dispatchScene: dispatch,
        selectedObjects,
        setSelectedObjects: handleSetSelectedObjects,
        onHoverObjectIn,
        onHoverObjectOut,
        hoveredObject,
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
