import { Modal } from "app/components/Modal";
import { useSceneContext } from "../Scene/Scene.context";
import { IoMoonOutline, IoAddOutline, IoTrashOutline } from "react-icons/io5";
import cn from "classnames";
import { useEffect, useState } from "react";
import { deleteScene, postScene } from "app/api/scene";
import { Tooltip } from "app/components/Tooltip";
import { initialSceneObjects } from "app/reducers/scene-reducer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const SceneSelection = () => {
  const {
    isSceneSelectionOpen,
    setIsSceneSelectionOpen,
    scenes,
    refetchScenes,
    scene: currentScene,
    dispatchScene,
  } = useSceneContext();
  const [deletingScene, setDeletingScene] = useState<number | null>(null);

  useEffect(() => {
    if (isSceneSelectionOpen) refetchScenes();
  }, [isSceneSelectionOpen, refetchScenes]);

  const handleDeleteScene = async (id: number) => {
    try {
      await deleteScene({ id });
      refetchScenes();
      setDeletingScene(null);
    } catch (error) {
      console.error("Error deleting scene:", error);
    }
  };

  const handleCreateScene = async () => {
    try {
      const newScene = await postScene({
        name: "Untitled",
        objects: initialSceneObjects,
      });
      refetchScenes();
      setIsSceneSelectionOpen(false);
      dispatchScene({
        type: "SET_SCENE",
        payload: { scene: newScene.scene },
        skipHistory: true,
      });
    } catch (error) {
      console.error("Error creating scene:", error);
    }
  };
  return (
    <Modal
      isOpen={isSceneSelectionOpen}
      onClose={() => setIsSceneSelectionOpen(false)}
    >
      <div className="grid grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className={cn({
              "text-white border border-gray-800 rounded-md p-3 w-[180px] h-[180px] flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-900 transition-all relative group":
                true,
              "!border-active": currentScene?.id === scene.id,
            })}
            onClick={() => {
              setIsSceneSelectionOpen(false);
              dispatchScene({
                type: "SET_SCENE",
                payload: { scene: scene },
                skipHistory: true,
              });
            }}
          >
            <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center">
              <IoMoonOutline className="w-6 h-6" />
            </div>
            <div className="mt-2 text-xs text-left w-full relative flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-ellipsis overflow-hidden whitespace-nowrap w-full">
                  {scene.name}
                </span>
                <span className="text-gray-400 text-[9px]">
                  Updated {dayjs(scene.updatedAt).fromNow()}
                </span>
              </div>
              <Tooltip
                text="Delete Scene"
                className="opacity-0 group-hover:opacity-100 transition-all"
              >
                <div
                  className="z-10 text-gray-400 hover:text-gray-300 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingScene(scene.id);
                  }}
                >
                  <IoTrashOutline className="w-[14px] h-[14px]" />
                </div>
              </Tooltip>
            </div>
          </div>
        ))}
        <div
          onClick={handleCreateScene}
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
