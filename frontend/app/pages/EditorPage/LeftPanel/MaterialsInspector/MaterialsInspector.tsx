import { useMemo } from "react";
import { useSceneContext } from "../../Scene/Scene.context";
import type { ObjectAttributes } from "app/types/scene-ast";
import type {
  BaseObjectWithMaterialAttributes,
  AbstractSyntaxTree,
} from "app/types/scene-ast";

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
    <div>
      {Object.entries(materials || {}).map(([materialJson, objects]) => {
        const material = JSON.parse(
          materialJson
        ) as BaseObjectWithMaterialAttributes;
        return (
          <div key={materialJson}>
            <div className="text-sm font-bold">{material.color}</div>
            {objects.map((object) => (
              <div key={object.id} className="text-[10px]">
                {object.attributes.name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
