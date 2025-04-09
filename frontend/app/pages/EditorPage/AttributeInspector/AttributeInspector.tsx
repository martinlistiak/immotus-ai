import { Card } from "app/components/Card";
import { BasicObjectAttributes } from "./attributes/BasicObjectAttributes";
import { useSceneContext } from "../Scene/Scene.context";

import { LightAttributes } from "./attributes/LightAttributes";
import { MaterialAttributes } from "./attributes/MaterialAttributes";

export const AttributeInspector = () => {
  const { selectedObjects } = useSceneContext();

  if (selectedObjects.length !== 1) return null;

  const selectedObject = selectedObjects[0];

  return (
    <>
      <BasicObjectAttributes />
      {selectedObject.type === "light" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <LightAttributes />
        </>
      )}
      {selectedObject.type !== "light" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <MaterialAttributes />
        </>
      )}
    </>
  );
};
