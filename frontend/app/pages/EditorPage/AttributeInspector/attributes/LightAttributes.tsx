import { Input } from "app/components/Input";
import { useSceneContext } from "../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  AbstractSyntaxTree,
  LightAttributes as LightAttributesType,
} from "app/types/scene-ast";
import { ColorInput } from "app/components/ColorInput";

export const LightAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const lightObject =
    selectedObjects[0] as AbstractSyntaxTree<LightAttributesType>;
  const [inputValues, setInputValues] = useState({
    color: "#ffffff",
    intensity: 1,
    distance: 100,
    decay: 2,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (lightObject) {
      setInputValues({
        color: lightObject.attributes.color,
        intensity: lightObject.attributes.intensity,
        distance: lightObject.attributes.distance,
        decay: lightObject.attributes.decay,
      });
    }
  }, [lightObject]);

  const handleInputChange =
    (kind: "color" | "intensity" | "distance" | "decay") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      // Allow empty or minus character during typing
      //   if (value === "" || value === "-") {
      setInputValues((prev) => ({
        ...prev,
        [kind]: value,
      }));

      switch (kind) {
        case "color":
          dispatchScene({
            type: "CHANGE_LIGHT_COLOR",
            payload: {
              objectId: lightObject.id,
              color: value,
            },
          });
          break;
        case "intensity":
          dispatchScene({
            type: "CHANGE_LIGHT_INTENSITY",
            payload: {
              objectId: lightObject.id,
              intensity: parseFloat(value),
            },
          });
          break;
        case "distance":
          dispatchScene({
            type: "CHANGE_LIGHT_DISTANCE",
            payload: {
              objectId: lightObject.id,
              distance: parseFloat(value),
            },
          });
          break;
        case "decay":
          dispatchScene({
            type: "CHANGE_LIGHT_DECAY",
            payload: {
              objectId: lightObject.id,
              decay: parseFloat(value),
            },
          });
          break;
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">Light</div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Color</div>
        <ColorInput
          value={inputValues.color}
          onChange={handleInputChange("color")}
        />
        <div>Intensity</div>
        <Input
          type="text"
          value={inputValues.intensity}
          onChange={handleInputChange("intensity")}
        />
        <div>Distance</div>
        <Input
          type="text"
          value={inputValues.distance}
          onChange={handleInputChange("distance")}
        />
        <div>Decay</div>
        <Input
          type="text"
          value={inputValues.decay}
          onChange={handleInputChange("decay")}
        />
      </div>
    </div>
  );
};
