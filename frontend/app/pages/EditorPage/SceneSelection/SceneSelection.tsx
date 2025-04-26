import { Modal } from "app/components/Modal";
import { useSceneContext } from "../Scene/Scene.context";
import { IoMoonOutline, IoAddOutline } from "react-icons/io5";
import cn from "classnames";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
export const SceneSelection = () => {
  const {
    isSceneSelectionOpen,
    setIsSceneSelectionOpen,
    scenes,
    refetchScenes,
    scene: currentScene,
    dispatchScene,
  } = useSceneContext();

  useEffect(() => {
    if (isSceneSelectionOpen) refetchScenes();
  }, [isSceneSelectionOpen, refetchScenes]);

  return (
    <Modal
      isOpen={isSceneSelectionOpen}
      onClose={() => setIsSceneSelectionOpen(false)}
    >
      <div className="grid grid-cols-3 gap-4">
        {scenes.map(({ scene }) => (
          <div
            onClick={() => {
              setIsSceneSelectionOpen(false);
              dispatchScene({
                type: "SET_SCENE",
                payload: { scene: scene },
              });
            }}
            key={scene.id}
            className={cn({
              "text-white border border-gray-800 rounded-md p-2 w-[130px] h-[130px] flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-900 transition-all":
                true,
              "!border-active": currentScene?.name === scene.name,
            })}
          >
            <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center">
              <IoMoonOutline className="w-6 h-6" />
            </div>
            <div className="mt-2 text-center text-ellipsis overflow-hidden whitespace-nowrap w-full">
              {scene.name}
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
          className="text-white border border-gray-800 rounded-md p-2 w-[130px] h-[130px] flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-900 transition-all"
        >
          <IoAddOutline className="w-6 h-6" />
        </div>
      </div>
    </Modal>
  );
};
