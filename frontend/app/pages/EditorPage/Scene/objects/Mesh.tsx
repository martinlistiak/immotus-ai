import { BoxHelper, BufferAttribute, BufferGeometry } from "three";

import type { MeshAttributes } from "app/types/scene-ast";

import type { AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext } from "../Scene.context";
import { useMemo, useRef, useState } from "react";
import type { Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export function MeshComponent(props: {
  object: AbstractSyntaxTree<MeshAttributes>;
}) {
  const {
    setSelectedObjects,
    selectedObjects,
    onHoverObjectIn,
    onHoverObjectOut,
    hoveredObject,
  } = useSceneContext();
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null);
  // Set up state for the hovered and active state
  const isHovered = hoveredObject?.id === props.object.id;

  // Add a ref for the mesh helper
  const meshHelperRef = useRef<BoxHelper>(null);

  // Update the mesh helper position in animation frame
  useFrame(() => {
    if (meshRef.current && meshHelperRef.current) {
      meshHelperRef.current.update();
    }
  });

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(props.object.attributes.geometry);
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  }, [props.object.attributes.geometry]);

  return (
    <>
      <mesh
        // {...props}
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObjects([props.object.id]);
        }}
        onPointerOver={(event) => onHoverObjectIn(props.object.id)}
        onPointerOut={(event) => onHoverObjectOut(props.object.id)}
        position={[
          props.object.attributes.position.x,
          props.object.attributes.position.y,
          props.object.attributes.position.z,
        ]}
        rotation={[
          props.object.attributes.rotation.x,
          props.object.attributes.rotation.y,
          props.object.attributes.rotation.z,
        ]}
        castShadow
        receiveShadow
        geometry={geometry}
      >
        {props.object.attributes.material && (
          <meshStandardMaterial
            color={props.object.attributes.material.color}
            roughness={props.object.attributes.material.roughness}
            metalness={props.object.attributes.material.metalness}
          />
        )}
        {!props.object.attributes.material?.color && (
          <meshStandardMaterial
            color={"orange"}
            roughness={0.7}
            metalness={0.2}
          />
        )}
      </mesh>
      {/* Conditional mesh helper */}
      {(isHovered ||
        selectedObjects.some((object) => object.id === props.object.id)) &&
        meshRef.current && (
          <primitive
            object={new BoxHelper(meshRef.current!, "#ffffff")}
            ref={meshHelperRef}
          >
            <lineBasicMaterial
              transparent
              depthTest={false}
              color="rgb(37, 137, 255)"
              linewidth={40}
            />
          </primitive>
        )}
    </>
  );
}
