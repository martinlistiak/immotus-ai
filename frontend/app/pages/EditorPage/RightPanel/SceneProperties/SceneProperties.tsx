import { useState } from "react";
import { useSceneContext } from "../../Scene/Scene.context";
import { ColorInput } from "app/components/ColorInput";
import { Input } from "app/components/Input";
import { Slider } from "app/components/Slider";

export const SceneProperties = () => {
  const { scene, dispatchScene } = useSceneContext();
  const [inputValues, setInputValues] = useState({
    ambientLightIntensity: scene?.ambientLightIntensity || 0.25,
    ambientLightColor: scene?.ambientLightColor || "#ffffff",
    showGrid: scene?.showGrid || true,
    backgroundColor: scene?.backgroundColor || "#2D2E32",
  });

  const handleInputChange =
    (name: string, skipHistory: boolean = false) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValues({
        ...inputValues,
        [name]:
          event.target.type === "checkbox"
            ? event.target.checked
            : event.target.value,
      });
      dispatchScene({
        type: "SET_SCENE",
        skipHistory,
        // @ts-ignore
        payload: {
          // @ts-ignore
          scene: {
            ...scene,
            [name]:
              event.target.type === "checkbox"
                ? event.target.checked
                : event.target.value,
          },
        },
      });
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">
        Ambient Light
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Intensity</div>
        <Slider
          min={0}
          max={1}
          value={[inputValues.ambientLightIntensity, 0]}
          onChange={(value) => {
            handleInputChange(
              "ambientLightIntensity",
              true
            )({
              target: {
                value: value[0],
              },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
        />
        <div>Color</div>
        <ColorInput
          name="ambientLightColor"
          value={inputValues.ambientLightColor}
          onChange={handleInputChange("ambientLightColor", true)}
          onBlur={handleInputChange("ambientLightColor", false)}
        />
      </div>
      <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
      <div className="text-[11px] text-white font-semibold mb-2">
        Background
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Color</div>
        <ColorInput
          name="backgroundColor"
          value={inputValues.backgroundColor}
          onChange={handleInputChange("backgroundColor", true)}
          onBlur={handleInputChange("backgroundColor", false)}
        />
        <div>Show Grid</div>
        <Input
          name="showGrid"
          type="checkbox"
          className="!w-[14px] !h-[14px]"
          checked={inputValues.showGrid}
          onChange={handleInputChange("showGrid", true)}
        />
      </div>
    </div>
  );
};
