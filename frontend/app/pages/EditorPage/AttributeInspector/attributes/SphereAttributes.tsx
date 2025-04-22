import { Input } from "app/components/Input";
import { useSceneContext } from "../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  SphereAttributes as SphereAttributesType,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

export const SphereAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const sphereObject =
    selectedObjects[0] as AbstractSyntaxTree<SphereAttributesType>;

  const [inputValues, setInputValues] = useState({
    radius: 1,
    widthSegments: 32,
    heightSegments: 16,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (sphereObject) {
      setInputValues({
        radius: sphereObject.attributes.radius || 1,
        widthSegments: sphereObject.attributes.widthSegments || 32,
        heightSegments: sphereObject.attributes.heightSegments || 16,
        phiStart: sphereObject.attributes.phiStart || 0,
        phiLength: sphereObject.attributes.phiLength || Math.PI * 2,
        thetaStart: sphereObject.attributes.thetaStart || 0,
        thetaLength: sphereObject.attributes.thetaLength || Math.PI,
      });
    }
  }, [sphereObject]);

  const handleInputChange =
    (
      property:
        | "radius"
        | "widthSegments"
        | "heightSegments"
        | "phiStart"
        | "phiLength"
        | "thetaStart"
        | "thetaLength"
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
          type: "CHANGE_SPHERE_PROPERTY",
          payload: {
            objectId: sphereObject.id,
            property,
            value: numValue,
          },
        });
      }
    };

  const validateInputOnBlur =
    (
      property:
        | "radius"
        | "widthSegments"
        | "heightSegments"
        | "phiStart"
        | "phiLength"
        | "thetaStart"
        | "thetaLength"
    ) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        let defaultValue = "1";
        if (property === "widthSegments") defaultValue = "32";
        if (property === "heightSegments") defaultValue = "16";
        if (property === "phiStart" || property === "thetaStart")
          defaultValue = "0";
        if (property === "phiLength") defaultValue = (Math.PI * 2).toString();
        if (property === "thetaLength") defaultValue = Math.PI.toString();

        e.target.value = defaultValue;
        handleInputChange(property)({
          target: { value: defaultValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">
        Sphere Properties
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Radius</div>
        <Input
          type="text"
          value={inputValues.radius}
          onChange={handleInputChange("radius")}
          onBlur={validateInputOnBlur("radius")}
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
        <div>Phi Start</div>
        <Input
          type="text"
          value={inputValues.phiStart}
          onChange={handleInputChange("phiStart")}
          onBlur={validateInputOnBlur("phiStart")}
        />
        <div>Phi Length</div>
        <Input
          type="text"
          value={inputValues.phiLength}
          onChange={handleInputChange("phiLength")}
          onBlur={validateInputOnBlur("phiLength")}
        />
        <div>Theta Start</div>
        <Input
          type="text"
          value={inputValues.thetaStart}
          onChange={handleInputChange("thetaStart")}
          onBlur={validateInputOnBlur("thetaStart")}
        />
        <div>Theta Len</div>
        <Input
          type="text"
          value={inputValues.thetaLength}
          onChange={handleInputChange("thetaLength")}
          onBlur={validateInputOnBlur("thetaLength")}
        />
      </div>
    </div>
  );
};
