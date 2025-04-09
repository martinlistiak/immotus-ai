import { Input } from "app/components/Input";
import { useSceneContext } from "../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type { BaseObjectWithMaterialAttributes } from "app/types/scene-ast";
import { ColorInput } from "app/components/ColorInput";
const validateColor = (color: string) => {
  if (!/^#([0-9a-fA-F]{6})$/.test(color)) {
    return;
  }
  return color;
};

export const MaterialAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const [inputValues, setInputValues] = useState({
    metalness: 0,
    roughness: 0,
    color: "#000000",
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (selectedObjects.length > 0) {
      const selectedObject = selectedObjects[0]
        .attributes as BaseObjectWithMaterialAttributes;
      setInputValues({
        metalness: selectedObject.material?.metalness ?? 0,
        roughness: selectedObject.material?.roughness ?? 0,
        color: selectedObject.material?.color ?? "#000000",
      });
    }
  }, [selectedObjects]);

  const handleInputChange =
    (kind: "metalness" | "roughness" | "color") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      // Allow empty or minus character during typing
      //   if (value === "" || value === "-") {
      setInputValues((prev) => ({
        ...prev,
        [kind]: value,
      }));

      const numValue = parseFloat(value);
      if (!isNaN(numValue) && kind !== "color") {
        switch (kind) {
          case "metalness":
            dispatchScene({
              type: "CHANGE_OBJECT_METALNESS",
              payload: {
                objectId: selectedObjects[0].id,
                metalness: numValue,
              },
            });
            break;
          case "roughness":
            dispatchScene({
              type: "CHANGE_OBJECT_ROUGHNESS",
              payload: {
                objectId: selectedObjects[0].id,
                roughness: numValue,
              },
            });
            break;
          default:
            break;
        }
      }
      if (kind === "color") {
        dispatchScene({
          type: "CHANGE_OBJECT_COLOR",
          payload: {
            objectId: selectedObjects[0].id,
            color: value,
          },
        });
      }
    };

  const validateInputOnBlur =
    (kind: "metalness" | "roughness" | "color") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue) && kind !== "color") {
        e.target.value = "0";
        handleInputChange(kind)({
          target: { value: "0" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
      if (kind === "color" && !validateColor(value)) {
        e.target.value = "#000000";
        handleInputChange("color")({
          target: { value: "#000000" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">Material</div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Color</div>
        <ColorInput
          value={inputValues.color}
          onChange={handleInputChange("color")}
          onBlur={validateInputOnBlur("color")}
        />
        <div>Metalness</div>
        <Input
          type="text"
          value={inputValues.metalness}
          onChange={handleInputChange("metalness")}
          onBlur={validateInputOnBlur("metalness")}
        />
        <div>Roughness</div>
        <Input
          type="text"
          value={inputValues.roughness}
          onChange={handleInputChange("roughness")}
          onBlur={validateInputOnBlur("roughness")}
        />
      </div>
    </div>
  );
};
