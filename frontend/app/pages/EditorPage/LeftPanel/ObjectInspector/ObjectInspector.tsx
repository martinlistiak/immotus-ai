import { useSceneContext } from "../../Scene/Scene.context";
import { ObjectTree, type TreeNodeType } from "./ObjectTree/ObjectTree";
import { DndProvider } from "./ObjectTree/DndProvider";
import { useMemo } from "react";
import type { ObjectAttributes, AbstractSyntaxTree } from "app/types/scene-ast";

const transformObjectsToTreeNodesRecursive = (
  objects: AbstractSyntaxTree<ObjectAttributes>[],
  parentObject: AbstractSyntaxTree<ObjectAttributes> | null
): TreeNodeType[] => {
  const rootObjects =
    objects.filter(
      (object) => object.parentId === (parentObject?.id ?? null)
    ) ?? [];
  const childObjects =
    objects.filter(
      (object) => object.parentId !== (parentObject?.id ?? null)
    ) ?? [];

  return rootObjects.map((object) => ({
    id: object.id,
    name: object.attributes.name,
    type: object.type,
    parentId: object.parentId,
    children: transformObjectsToTreeNodesRecursive(childObjects, object),
  })) as TreeNodeType[];
};
export const ObjectInspector = () => {
  const { scene } = useSceneContext();

  const nodes = useMemo(
    () => transformObjectsToTreeNodesRecursive(scene?.objects ?? [], null),
    [scene?.objects]
  );

  return (
    <DndProvider>
      <ObjectTree nodes={nodes} level={0} />
      {!nodes.length && (
        <div className="p-4 flex items-center justify-center h-full text-[10px] text-gray-500 flex-col">
          <p className="">
            <i>"When we build, let us think that we build forever."</i>
            <br />
          </p>
          <p className="text-right w-full pr-4">- John Ruskin</p>
        </div>
      )}
    </DndProvider>
  );
};
