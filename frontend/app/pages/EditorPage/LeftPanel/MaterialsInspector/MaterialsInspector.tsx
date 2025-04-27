import { useMemo } from "react";
import { useSceneContext } from "../../Scene/Scene.context";
import type { BoxAttributes, ObjectAttributes } from "app/types/scene-ast";
import type {
  BaseObjectWithMaterialAttributes,
  AbstractSyntaxTree,
} from "app/types/scene-ast";
import { GiCircularSaw } from "react-icons/gi";
import { ColorInput } from "app/components/ColorInput";
import { Input } from "app/components/Input";
import { Tooltip } from "app/components/Tooltip";

export const MaterialsInspector = () => {
  const { scene } = useSceneContext();

  const materials = useMemo(() => {
    return scene?.objects
      .filter(
        (object) =>
          (object.attributes as BaseObjectWithMaterialAttributes).material
      )
      .reduce((acc, object: AbstractSyntaxTree<ObjectAttributes>) => {
        const material = (object.attributes as BaseObjectWithMaterialAttributes)
          .material;
        const materialJson = JSON.stringify(material);
        if (!acc[materialJson]) {
          acc[materialJson] = [object];
        } else {
          acc[materialJson].push(object);
        }
        return acc;
      }, {} as Record<string, AbstractSyntaxTree<ObjectAttributes>[]>);
  }, [scene]);
  return (
    <div className="p-2">
      {Object.entries(materials || {}).map(([materialJson, objects], i) => {
        const material = JSON.parse(
          materialJson
        ) as BaseObjectWithMaterialAttributes["material"];

        const squareMeters = objects.reduce((acc, object) => {
          const sidesOrderedBySize = [
            (object.attributes as BoxAttributes).scale.x,
            (object.attributes as BoxAttributes).scale.y,
            (object.attributes as BoxAttributes).scale.z,
          ].sort((a, b) => a - b);

          return acc + sidesOrderedBySize[1] * sidesOrderedBySize[2];
        }, 0);

        const totalVolume = objects.reduce((acc, object) => {
          return (
            acc +
            (object.attributes as BoxAttributes).scale.x *
              (object.attributes as BoxAttributes).scale.y *
              (object.attributes as BoxAttributes).scale.z
          );
        }, 0);

        return (
          <div
            key={materialJson}
            className="text-[11px] mb-3 border-b border-white/10 pb-4"
          >
            <div className="flex items-center gap-x-2 mb-2 justify-between">
              <div className="text-white font-semibold">Material {i + 1}</div>
              <Tooltip text="Cutting plan">
                <GiCircularSaw className="text-white/50 w-6 h-6 hover:text-white cursor-pointer hover:bg-gray-800 rounded-sm p-1" />
              </Tooltip>
            </div>

            <div>
              <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
                <div>Color</div>
                <ColorInput value={material.color} disabled />
                <div>Metalness</div>
                <Input type="text" value={material.metalness} disabled />
                <div>Roughness</div>
                <Input type="text" value={material.roughness} disabled />
                <div className="font-semibold">Total area</div>
                <div>{squareMeters.toFixed(2)} m²</div>
                <div className="font-semibold">Volume</div>
                <div>{totalVolume.toFixed(2)} m³</div>
              </div>
              {/* {objects.map((object) => (
                <div key={object.id} className="text-[10px]">
                  {object.attributes.name}
                </div>
              ))} */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
