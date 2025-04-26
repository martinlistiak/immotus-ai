import { Input } from "app/components/Input";
import { useSceneContext } from "../../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  ConeAttributes as ConeAttributesType,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

export const ConeAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const coneObject =
    selectedObjects[0] as AbstractSyntaxTree<ConeAttributesType>;

  const [inputValues, setInputValues] = useState({
    radius: 1,
    height: 1,
    radialSegments: 32,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (coneObject) {
      setInputValues({
        radius: coneObject.attributes.radius,
        height: coneObject.attributes.height,
        radialSegments: coneObject.attributes.radialSegments || 32,
        heightSegments: coneObject.attributes.heightSegments || 1,
        openEnded: coneObject.attributes.openEnded || false,
        thetaStart: coneObject.attributes.thetaStart || 0,
        thetaLength: coneObject.attributes.thetaLength || Math.PI * 2,
      });
    }
  }, [coneObject]);

  const handleInputChange =
    (
      property:
        | "radius"
        | "height"
        | "radialSegments"
        | "heightSegments"
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
          type: "CHANGE_CONE_PROPERTY",
          payload: {
            objectId: coneObject.id,
            property,
            value: numValue,
          },
        });
      }
    };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setInputValues((prev) => ({
      ...prev,
      openEnded: checked,
    }));

    dispatchScene({
      type: "CHANGE_CONE_PROPERTY",
      payload: {
        objectId: coneObject.id,
        property: "openEnded",
        value: checked,
      },
    });
  };

  const validateInputOnBlur =
    (
      property:
        | "radius"
        | "height"
        | "radialSegments"
        | "heightSegments"
        | "thetaStart"
        | "thetaLength"
    ) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        let defaultValue = "1";
        if (property === "radialSegments") defaultValue = "32";
        if (property === "heightSegments") defaultValue = "1";
        if (property === "thetaStart") defaultValue = "0";
        if (property === "thetaLength") defaultValue = (Math.PI * 2).toString();

        e.target.value = defaultValue;
        handleInputChange(property)({
          target: { value: defaultValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

  return (
    <div>
      <div className="text-[11px] text-white font-semibold mb-2">
        Cone Properties
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Radius</div>
        <Input
          type="text"
          value={inputValues.radius}
          onChange={handleInputChange("radius")}
          onBlur={validateInputOnBlur("radius")}
        />
        <div>Height</div>
        <Input
          type="text"
          value={inputValues.height}
          onChange={handleInputChange("height")}
          onBlur={validateInputOnBlur("height")}
        />
        <div>Radial Segs</div>
        <Input
          type="text"
          value={inputValues.radialSegments}
          onChange={handleInputChange("radialSegments")}
          onBlur={validateInputOnBlur("radialSegments")}
        />
        <div>Height Segs</div>
        <Input
          type="text"
          value={inputValues.heightSegments}
          onChange={handleInputChange("heightSegments")}
          onBlur={validateInputOnBlur("heightSegments")}
        />
        <div>Open Ended</div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={inputValues.openEnded}
            onChange={handleCheckboxChange}
            className="mr-2 h-3 w-3"
          />
        </div>
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
