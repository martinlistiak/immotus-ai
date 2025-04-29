import { Card } from "app/components/Card";
import { ObjectInspector } from "./ObjectInspector/ObjectInspector";
import { BsArrowLeft } from "react-icons/bs";
import { useSceneContext } from "../Scene/Scene.context";
import { Tabs } from "app/components/Tabs";
import { useEffect, useState } from "react";
import { MaterialsInspector } from "./MaterialsInspector/MaterialsInspector";
enum LeftPanelTabs {
  Scene = "Scene",
  Materials = "Materials",
  Library = "Library",
}

export const LeftPanel = () => {
  const {
    scene,
    dispatchScene,
    isSceneSelectionOpen,
    setIsSceneSelectionOpen,
  } = useSceneContext();
  const [sceneName, setSceneName] = useState(scene?.name);
  const [activeTab, setActiveTab] = useState(LeftPanelTabs.Scene);

  useEffect(() => {
    setSceneName(scene?.name);
  }, [scene]);

  return (
    <Card className="fixed top-4 !p-0 left-4 bottom-4 w-[230px] h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 mb-2">
        <div
          onClick={() => {
            setIsSceneSelectionOpen(!isSceneSelectionOpen);
          }}
          className="text-sm text-gray-400 cursor-pointer hover:text-gray-200"
        >
          <BsArrowLeft className="w-[14px] h-[14px]" />
        </div>
        <input
          type="text"
          className="text-[10px] -m-1 p-1 bg-transparent border border-transparent outline-none w-full hover:border-gray-700 rounded-sm"
          value={sceneName}
          onChange={(e) => {
            setSceneName(e.target.value);
          }}
          onFocus={(e) => {
            // select the whole text
            e.currentTarget.select();
          }}
          onClick={(e) => {
            e.preventDefault();
          }}
          onBlur={(e) => {
            dispatchScene({
              type: "SET_SCENE",
              payload: {
                scene: {
                  ...scene!,
                  name: e.target.value,
                },
              },
              skipHistory: true,
            });
          }}
        />
      </div>
      <Tabs
        tabs={[
          LeftPanelTabs.Scene,
          LeftPanelTabs.Materials,
          LeftPanelTabs.Library,
        ]}
        activeTab={activeTab}
        size="sm"
        setActiveTab={(tab) => setActiveTab(tab as LeftPanelTabs)}
      />
      <div className="flex-1 h-full relative">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar">
          {activeTab === LeftPanelTabs.Scene && <ObjectInspector />}
          {activeTab === LeftPanelTabs.Materials && <MaterialsInspector />}
          {activeTab === LeftPanelTabs.Library && <div>Library</div>}
        </div>
      </div>
    </Card>
  );
};
