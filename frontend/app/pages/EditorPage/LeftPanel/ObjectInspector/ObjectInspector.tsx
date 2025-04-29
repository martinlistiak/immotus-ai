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
    </DndProvider>
  );
};
