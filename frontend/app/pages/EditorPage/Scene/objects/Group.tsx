import { useSceneContext } from "../Scene.context";
import { Fragment, useRef } from "react";
import type {
  AbstractSyntaxTree,
  ObjectAttributes,
  BoxAttributes,
  SphereAttributes,
  LightAttributes,
  MeshAttributes,
} from "app/types/scene-ast";
import { Box } from "./Box";
import { Sphere } from "./Sphere";
import { Light } from "./Light";
import { MeshComponent } from "./Mesh";
import { BoxHelper, Mesh } from "three";
import { useFrame } from "@react-three/fiber";

export function GroupComponent({
  object,
}: {
  object: AbstractSyntaxTree<ObjectAttributes>;
}) {
  const { scene, selectedObjects, hoveredObject } = useSceneContext();
  if (!scene) return null;

  // Find children of this group
  const children = scene.objects.filter(
    (child) => child.parentId === object.id
  );

  const meshRef = useRef<Mesh>(null);

  // Add a ref for the box helper
  const boxHelperRef = useRef<BoxHelper>(null);

  // Update the box helper position in animation frame
  useFrame(() => {
    if (meshRef.current && boxHelperRef.current) {
      boxHelperRef.current.update();
    }
  });

  return (
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
    >
      {children.map((child) => (
        <Fragment key={child.id}>
          {child.type === "box" && (
            <Box object={child as AbstractSyntaxTree<BoxAttributes>} />
          )}
          {child.type === "sphere" && (
            <Sphere object={child as AbstractSyntaxTree<SphereAttributes>} />
          )}
          {child.type === "light" && (
            <Light object={child as AbstractSyntaxTree<LightAttributes>} />
          )}
          {child.type === "mesh" && (
            <MeshComponent
              object={child as AbstractSyntaxTree<MeshAttributes>}
            />
          )}
          {child.type === "group" && <GroupComponent object={child} />}
        </Fragment>
      ))}
      {(hoveredObject?.id === object.id ||
        selectedObjects.some((o) => o.id === object.id)) &&
        meshRef.current && (
          <primitive
            object={new BoxHelper(meshRef.current!, "#ffffff")}
            ref={boxHelperRef}
          >
            <lineBasicMaterial
              transparent
              depthTest={false}
              color="rgb(37, 137, 255)"
              linewidth={40}
            />
          </primitive>
        )}
    </group>
  );
}
