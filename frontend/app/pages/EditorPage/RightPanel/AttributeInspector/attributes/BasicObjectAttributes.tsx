import { Input } from "app/components/Input";
import { useSceneContext } from "../../../Scene/Scene.context";
import { useState, useEffect } from "react";

export const BasicObjectAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const [inputValues, setInputValues] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (selectedObjects.length > 0) {
      const selectedObject = selectedObjects[0];
      setInputValues({
        position: { ...selectedObject.attributes.position },
        rotation: { ...selectedObject.attributes.rotation },
        scale: { ...selectedObject.attributes.scale },
      });
    }
  }, [selectedObjects]);

  const handleInputChange =
    (coordinate: "x" | "y" | "z", kind: "position" | "rotation" | "scale") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      // Allow empty or minus character during typing
      //   if (value === "" || value === "-") {
      setInputValues((prev) => ({
        ...prev,
        [kind]: {
          ...prev[kind],
          [coordinate]: value,
        },
      }));

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        switch (kind) {
          case "position":
            dispatchScene({
              type: "CHANGE_OBJECT_POSITION",
              payload: {
                objectId: selectedObjects[0].id,
                position: numValue,
                coordinate,
              },
            });
            break;
          case "rotation":
            dispatchScene({
              type: "CHANGE_OBJECT_ROTATION",
              payload: {
                objectId: selectedObjects[0].id,
                rotation: numValue,
                coordinate,
              },
            });
            break;
          case "scale":
            dispatchScene({
              type: "CHANGE_OBJECT_SCALE",
              payload: {
                objectId: selectedObjects[0].id,
                scale: numValue,
                coordinate,
              },
            });
            break;
          default:
            break;
        }
      }
    };

  const validateInputOnBlur =
    (coordinate: "x" | "y" | "z", kind: "position" | "rotation" | "scale") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        e.target.value = "0";
        handleInputChange(
          coordinate,
          kind
        )({
          target: { value: "0" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div className="grid grid-cols-[50px_1fr] justify-end gap-x-1 gap-y-1 text-[12px] items-center">
      <div>Position</div>
      <div className="grid grid-cols-3 gap-x-2">
        <Input
          type="text"
          value={inputValues.position.x}
          prefix="X"
          onChange={handleInputChange("x", "position")}
          onBlur={validateInputOnBlur("x", "position")}
        />
        <Input
          type="text"
          value={inputValues.position.y}
          prefix="Y"
          onChange={handleInputChange("y", "position")}
          onBlur={validateInputOnBlur("y", "position")}
        />
        <Input
          type="text"
          value={inputValues.position.z}
          prefix="Z"
          onChange={handleInputChange("z", "position")}
          onBlur={validateInputOnBlur("z", "position")}
        />
      </div>
      <div>Rotation</div>
      <div className="grid grid-cols-3 gap-x-1">
        <Input
          type="text"
          value={inputValues.rotation.x}
          prefix="X"
          onChange={handleInputChange("x", "rotation")}
          onBlur={validateInputOnBlur("x", "rotation")}
        />
        <Input
          type="text"
          value={inputValues.rotation.y}
          prefix="Y"
          onChange={handleInputChange("y", "rotation")}
          onBlur={validateInputOnBlur("y", "rotation")}
        />
        <Input
          type="text"
          value={inputValues.rotation.z}
          prefix="Z"
          onChange={handleInputChange("z", "rotation")}
          onBlur={validateInputOnBlur("z", "rotation")}
        />
      </div>
      <div>Scale</div>
      <div className="grid grid-cols-3 gap-x-1">
        <Input
          type="text"
          value={inputValues.scale.x}
          prefix="X"
          onChange={handleInputChange("x", "scale")}
          onBlur={validateInputOnBlur("x", "scale")}
        />
        <Input
          type="text"
          value={inputValues.scale.y}
          prefix="Y"
          onChange={handleInputChange("y", "scale")}
          onBlur={validateInputOnBlur("y", "scale")}
        />
        <Input
          type="text"
          value={inputValues.scale.z}
          prefix="Z"
          onChange={handleInputChange("z", "scale")}
          onBlur={validateInputOnBlur("z", "scale")}
        />
      </div>
    </div>
  );
};
