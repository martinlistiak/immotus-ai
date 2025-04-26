import { Input } from "app/components/Input";
import { useSceneContext } from "../../../Scene/Scene.context";
import { useState, useEffect } from "react";
import type {
  CircleAttributes as CircleAttributesType,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

export const CircleAttributes = () => {
  const { selectedObjects, dispatchScene } = useSceneContext();
  const circleObject =
    selectedObjects[0] as AbstractSyntaxTree<CircleAttributesType>;

  const [inputValues, setInputValues] = useState({
    radius: 1,
    segments: 32,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
  });

  // Update input values when selected object changes
  useEffect(() => {
    if (circleObject) {
      setInputValues({
        radius: circleObject.attributes.radius,
        segments: circleObject.attributes.segments || 32,
        thetaStart: circleObject.attributes.thetaStart || 0,
        thetaLength: circleObject.attributes.thetaLength || Math.PI * 2,
      });
    }
  }, [circleObject]);

  const handleInputChange =
    (property: "radius" | "segments" | "thetaStart" | "thetaLength") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setInputValues((prev) => ({
        ...prev,
        [property]: value,
      }));

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        dispatchScene({
          type: "CHANGE_CIRCLE_PROPERTY",
          payload: {
            objectId: circleObject.id,
            property,
            value: numValue,
          },
        });
      }
    };

  const validateInputOnBlur =
    (property: "radius" | "segments" | "thetaStart" | "thetaLength") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        let defaultValue = "1";
        if (property === "segments") defaultValue = "32";
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
        Circle Properties
      </div>
      <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
        <div>Radius</div>
        <Input
          type="text"
          value={inputValues.radius}
          onChange={handleInputChange("radius")}
          onBlur={validateInputOnBlur("radius")}
        />
        <div>Segments</div>
        <Input
          type="text"
          value={inputValues.segments}
          onChange={handleInputChange("segments")}
          onBlur={validateInputOnBlur("segments")}
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
