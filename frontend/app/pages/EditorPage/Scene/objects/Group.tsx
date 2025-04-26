import { useSceneContext } from "../Scene.context";
import { Fragment, useRef } from "react";
import type {
  AbstractSyntaxTree,
  ObjectAttributes,
  BoxAttributes,
  SphereAttributes,
  LightAttributes,
  MeshAttributes,
  CylinderAttributes,
  PlaneAttributes,
  ConeAttributes,
  TorusKnotAttributes,
  TextAttributes,
  TetrahedronAttributes,
  OctahedronAttributes,
  IcosahedronAttributes,
  DodecahedronAttributes,
  CircleAttributes,
  RingAttributes,
  TorusAttributes,
} from "app/types/scene-ast";
import { Box } from "./Box";
import { Sphere } from "./Sphere";
import { Light } from "./Light";
import { MeshComponent } from "./Mesh";
import { BoxHelper, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Cylinder } from "./Cylinder";
import { Cone } from "./Cone";
import { Plane } from "./Plane";
import { TorusKnot } from "./TorusKnot";
import { Tetrahedron } from "./Tetrahedron";
import { Octahedron } from "./Octahedron";
import { Icosahedron } from "./Icosahedron";
import { Dodecahedron } from "./Dodecahedron";
import { Circle } from "./Circle";
import { Ring } from "./Ring";
import { Torus } from "./Torus";
import { Text } from "./Text";
export function GroupComponent({
  object,
}: {
  object: AbstractSyntaxTree<ObjectAttributes>;
}) {
  const { scene, selectedObjects, hoveredObject, hiddenObjectIds } =
    useSceneContext();
  if (!scene) return null;

  // Find children of this group
  const children = scene.objects.filter(
    (child) =>
      child.parentId === object.id && !hiddenObjectIds.includes(child.id)
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
          {child.type === "plane" && (
            <Plane object={child as AbstractSyntaxTree<PlaneAttributes>} />
          )}
          {child.type === "cylinder" && (
            <Cylinder
              object={child as AbstractSyntaxTree<CylinderAttributes>}
            />
          )}
          {child.type === "cone" && (
            <Cone object={child as AbstractSyntaxTree<ConeAttributes>} />
          )}
          {child.type === "torus" && (
            <Torus object={child as AbstractSyntaxTree<TorusAttributes>} />
          )}
          {child.type === "circle" && (
            <Circle object={child as AbstractSyntaxTree<CircleAttributes>} />
          )}
          {child.type === "ring" && (
            <Ring object={child as AbstractSyntaxTree<RingAttributes>} />
          )}
          {child.type === "dodecahedron" && (
            <Dodecahedron
              object={child as AbstractSyntaxTree<DodecahedronAttributes>}
            />
          )}
          {child.type === "icosahedron" && (
            <Icosahedron
              object={child as AbstractSyntaxTree<IcosahedronAttributes>}
            />
          )}
          {child.type === "octahedron" && (
            <Octahedron
              object={child as AbstractSyntaxTree<OctahedronAttributes>}
            />
          )}
          {child.type === "tetrahedron" && (
            <Tetrahedron
              object={child as AbstractSyntaxTree<TetrahedronAttributes>}
            />
          )}
          {child.type === "torusknot" && (
            <TorusKnot
              object={child as AbstractSyntaxTree<TorusKnotAttributes>}
            />
          )}
          {child.type === "text" && (
            <Text object={child as AbstractSyntaxTree<TextAttributes>} />
          )}
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
