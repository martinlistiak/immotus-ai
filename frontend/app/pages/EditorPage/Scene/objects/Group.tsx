import { useSceneContext } from "../Scene.context";
import { Fragment, useRef } from "react";
import type { AbstractSyntaxTree, ObjectAttributes } from "app/types/scene-ast";
import { Mesh } from "three";
import { SceneObject } from "./SceneObject";

export function GroupComponent({
  object,
}: {
  object: AbstractSyntaxTree<ObjectAttributes>;
}) {
  const { scene, hiddenObjectIds } = useSceneContext();
  if (!scene) return null;

  // Find children of this group
  const children = scene.objects.filter(
    (child) =>
      child.parentId === object.id && !hiddenObjectIds.includes(child.id)
  );

  const meshRef = useRef<Mesh>(null);

  return (
    <>
      <group
        ref={meshRef}
        position={
          object.attributes.position
            ? [
                object.attributes.position.x,
                object.attributes.position.y,
                object.attributes.position.z,
              ]
            : undefined
        }
        rotation={
          object.attributes.rotation
            ? [
                object.attributes.rotation.x,
                object.attributes.rotation.y,
                object.attributes.rotation.z,
              ]
            : undefined
        }
        scale={
          object.attributes.scale
            ? [
                object.attributes.scale.x,
                object.attributes.scale.y,
                object.attributes.scale.z,
              ]
            : undefined
        }
        name={object.attributes.name}
        userData={{
          id: object.id,
        }}
      >
        {children.map((child) => (
          <Fragment key={child.id}>
            <SceneObject object={child} />
          </Fragment>
        ))}
      </group>
    </>
  );
}
