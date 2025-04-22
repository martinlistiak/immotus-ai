import { Input } from "app/components/Input";
import { useSceneContext } from "../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  PlaneAttributes as PlaneAttributesType,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

export const PlaneAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const planeObject =
    selectedObjects[0] as AbstractSyntaxTree<PlaneAttributesType>;

  const [inputValues, setInputValues] = useState({
    width: 1,
    height: 1,
    widthSegments: 1,
    heightSegments: 1,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (planeObject) {
      setInputValues({
        width: planeObject.attributes.width,
        height: planeObject.attributes.height,
        widthSegments: planeObject.attributes.widthSegments || 1,
        heightSegments: planeObject.attributes.heightSegments || 1,
      });
    }
  }, [planeObject]);

  const handleInputChange =
    (property: "width" | "height" | "widthSegments" | "heightSegments") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setInputValues((prev) => ({
        ...prev,
        [property]: value,
      }));

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        dispatchScene({
          type: "CHANGE_PLANE_PROPERTY",
          payload: {
            objectId: planeObject.id,
            property,
            value: numValue,
          },
        });
      }
    };

  const validateInputOnBlur =
    (property: "width" | "height" | "widthSegments" | "heightSegments") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        const defaultValue =
          property === "width" || property === "height" ? "1" : "1";
        e.target.value = defaultValue;
        handleInputChange(property)({
          target: { value: defaultValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">
        Plane Properties
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Width</div>
        <Input
          type="text"
          value={inputValues.width}
          onChange={handleInputChange("width")}
          onBlur={validateInputOnBlur("width")}
        />
        <div>Height</div>
        <Input
          type="text"
          value={inputValues.height}
          onChange={handleInputChange("height")}
          onBlur={validateInputOnBlur("height")}
        />
        <div>Width Segs</div>
        <Input
          type="text"
          value={inputValues.widthSegments}
          onChange={handleInputChange("widthSegments")}
          onBlur={validateInputOnBlur("widthSegments")}
        />
        <div>Height Segs</div>
        <Input
          type="text"
          value={inputValues.heightSegments}
          onChange={handleInputChange("heightSegments")}
          onBlur={validateInputOnBlur("heightSegments")}
        />
      </div>
    </div>
  );
};
