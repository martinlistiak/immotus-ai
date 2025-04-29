import { Modal } from "app/components/Modal";
import { useSceneContext } from "../Scene/Scene.context";
import { IoMoonOutline, IoAddOutline, IoTrashOutline } from "react-icons/io5";
import cn from "classnames";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { deleteScene } from "app/api/scene";
import { Tooltip } from "app/components/Tooltip";

export const SceneSelection = () => {
  const {
    isSceneSelectionOpen,
    setIsSceneSelectionOpen,
    scenes,
    refetchScenes,
    scene: currentScene,
    dispatchScene,
  } = useSceneContext();
  const [deletingScene, setDeletingScene] = useState<string | null>(null);

  useEffect(() => {
    if (isSceneSelectionOpen) refetchScenes();
  }, [isSceneSelectionOpen, refetchScenes]);

  const handleDeleteScene = async (sceneName: string) => {
    try {
      await deleteScene({ name: sceneName });
      refetchScenes();
      setDeletingScene(null);
    } catch (error) {
      console.error("Error deleting scene:", error);
    }
  };

  return (
    <Modal
      isOpen={isSceneSelectionOpen}
      onClose={() => setIsSceneSelectionOpen(false)}
    >
      <div className="grid grid-cols-3 gap-4">
        {scenes.map(({ scene }) => (
          <div
            key={scene.name}
            className={cn({
              "text-white border border-gray-800 rounded-md p-3 w-[180px] h-[180px] flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-900 transition-all relative group":
                true,
              "!border-active": currentScene?.name === scene.name,
            })}
          >
            <div
              className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center"
              onClick={() => {
                setIsSceneSelectionOpen(false);
                dispatchScene({
                  type: "SET_SCENE",
                  payload: { scene: scene },
                  skipHistory: true,
                });
              }}
            >
              <IoMoonOutline className="w-6 h-6" />
            </div>
            <div className="mt-3 text-xs text-left w-full relative flex items-center justify-between gap-2">
              <span className="text-ellipsis overflow-hidden whitespace-nowrap w-full">
                {scene.name}
              </span>
              <Tooltip
                text="Delete Scene"
                className="opacity-0 group-hover:opacity-100 transition-all"
              >
                <div
                  className="z-10 text-gray-400 hover:text-gray-300 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingScene(scene.name);
                  }}
                >
                  <IoTrashOutline className="w-[14px] h-[14px]" />
                </div>
              </Tooltip>
            </div>
          </div>
        ))}
        <div
          onClick={() => {
            setIsSceneSelectionOpen(false);
            dispatchScene({
              type: "SET_SCENE",
              payload: {
                scene: {
                  id: uuidv4(),
                  name: "New Scene",
                  description: "New Scene",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  objects: [
                    {
                      id: uuidv4(),
                      type: "box",
                      attributes: {
                        name: "New Box",
                        description: "New Box",
                        position: { x: 0, y: 0, z: 0 },
                        rotation: { x: 0, y: 0, z: 0 },
                        scale: { x: 1, y: 1, z: 1 },
                        material: {
                          color: "#ffffff",
                          roughness: 0.5,
                          metalness: 0.5,
                        },
                      },
                      parentId: null,
                    },
                    {
                      id: uuidv4(),
                      type: "light",
                      attributes: {
                        name: "New Light",
                        description: "New Light",
                        position: { x: 0, y: 0, z: 0 },
                        rotation: { x: 0, y: 0, z: 0 },
                        scale: { x: 1, y: 1, z: 1 },
                        color: "#ffffff",
                        intensity: 1,
                        distance: 10,
                        decay: 0,
                      },
                      parentId: null,
                    },
                  ],
                },
              },
            });
          }}
          className="text-white border border-gray-800 rounded-md p-2 w-[180px] h-[180px] flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-900 transition-all"
        >
          <IoAddOutline className="w-6 h-6" />
        </div>
      </div>
      {deletingScene && (
        <Modal
          isOpen={!!deletingScene}
          onClose={() => setDeletingScene(null)}
          className="px-8 grid gap-4"
        >
          <div className="text-white text-lg">Delete Scene</div>
          <div className="text-gray-400 text-sm max-w-[300px]">
            Are you sure you want to delete the scene "{deletingScene}"? This
            action cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeletingScene(null)}
              className="text-gray-400 hover:text-gray-300 bg-gray-800 px-4 py-2 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteScene(deletingScene)}
              className="bg-active text-white hover:bg-active-hover px-4 py-2 rounded-md cursor-pointer"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
