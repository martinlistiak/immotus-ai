import { Card } from "app/components/Card";
import { useSceneContext } from "../Scene/Scene.context";
import { ObjectTree, type TreeNodeType } from "./ObjectTree/ObjectTree";
import { useMemo, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
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
    children: transformObjectsToTreeNodesRecursive(childObjects, object),
  })) as TreeNodeType[];
};
export const ObjectInspector = () => {
  const [viewing, setViewing] = useState<"scenes" | "objects">("scenes");
  const { scene } = useSceneContext();

  const nodes = useMemo(
    () => transformObjectsToTreeNodesRecursive(scene?.objects ?? [], null),
    [scene?.objects]
  );

  return (
    <Card className="fixed top-4 !p-0 left-4 bottom-4 w-[230px] h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 mb-4">
        <div
          onClick={() => {
            setViewing(viewing === "scenes" ? "objects" : "scenes");
            if (viewing === "scenes") {
            }
          }}
          className="text-sm text-gray-400 cursor-pointer hover:text-gray-200"
        >
          <BsArrowLeft className="w-[14px] h-[14px]" />
        </div>
        <h1 className="text-[10px]">{scene?.name}</h1>
      </div>
      <div>
        <ObjectTree nodes={nodes} level={0} />
      </div>
    </Card>
  );
};
