import { Input } from "app/components/Input";
import { useSceneContext } from "../../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  TorusAttributes as TorusAttributesType,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

export const TorusAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const torusObject =
    selectedObjects[0] as AbstractSyntaxTree<TorusAttributesType>;

  const [inputValues, setInputValues] = useState({
    radius: 1,
    tube: 0.4,
    radialSegments: 8,
    tubularSegments: 32,
    arc: Math.PI * 2,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (torusObject) {
      setInputValues({
        radius: torusObject.attributes.radius,
        tube: torusObject.attributes.tube,
        radialSegments: torusObject.attributes.radialSegments || 8,
        tubularSegments: torusObject.attributes.tubularSegments || 32,
        arc: torusObject.attributes.arc || Math.PI * 2,
      });
    }
  }, [torusObject]);

  const handleInputChange =
    (
      property: "radius" | "tube" | "radialSegments" | "tubularSegments" | "arc"
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setInputValues((prev) => ({
        ...prev,
        [property]: value,
      }));

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        dispatchScene({
          type: "CHANGE_TORUS_PROPERTY",
          payload: {
            objectId: torusObject.id,
            property,
            value: numValue,
          },
        });
      }
    };

  const validateInputOnBlur =
    (
      property: "radius" | "tube" | "radialSegments" | "tubularSegments" | "arc"
    ) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        let defaultValue = "1";
        if (property === "tube") defaultValue = "0.4";
        if (property === "radialSegments") defaultValue = "8";
        if (property === "tubularSegments") defaultValue = "32";
        if (property === "arc") defaultValue = (Math.PI * 2).toString();

        e.target.value = defaultValue;
        handleInputChange(property)({
          target: { value: defaultValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">
        Torus Properties
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Radius</div>
        <Input
          type="text"
          value={inputValues.radius}
          onChange={handleInputChange("radius")}
          onBlur={validateInputOnBlur("radius")}
        />
        <div>Tube</div>
        <Input
          type="text"
          value={inputValues.tube}
          onChange={handleInputChange("tube")}
          onBlur={validateInputOnBlur("tube")}
        />
        <div>Radial Segs</div>
        <Input
          type="text"
          value={inputValues.radialSegments}
          onChange={handleInputChange("radialSegments")}
          onBlur={validateInputOnBlur("radialSegments")}
        />
        <div>Tubular Segs</div>
        <Input
          type="text"
          value={inputValues.tubularSegments}
          onChange={handleInputChange("tubularSegments")}
          onBlur={validateInputOnBlur("tubularSegments")}
        />
        <div>Arc</div>
        <Input
          type="text"
          value={inputValues.arc}
          onChange={handleInputChange("arc")}
          onBlur={validateInputOnBlur("arc")}
        />
      </div>
    </div>
  );
};
