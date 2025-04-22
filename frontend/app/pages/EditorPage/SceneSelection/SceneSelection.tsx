import { Modal } from "app/components/Modal";
import { useSceneContext } from "../Scene/Scene.context";
import { IoMoonOutline } from "react-icons/io5";
import cn from "classnames";
export const SceneSelection = () => {
  const {
    isSceneSelectionOpen,
    setIsSceneSelectionOpen,
    scenes,
    scene: currentScene,
    dispatchScene,
  } = useSceneContext();

  console.log(scenes, isSceneSelectionOpen);

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
      </div>
    </Modal>
  );
};
