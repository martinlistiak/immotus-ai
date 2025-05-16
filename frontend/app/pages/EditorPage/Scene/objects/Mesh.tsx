import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  BackSide,
  Mesh as ThreeMesh,
} from "three";

import type { MeshAttributes } from "app/types/scene-ast";

import type { AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext, useSceneHoverContext } from "../Scene.context";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function MeshComponent(props: {
  object: AbstractSyntaxTree<MeshAttributes>;
}) {
  const { setSelectedObjects } = useSceneContext();
  const { onHoverObjectIn, onHoverObjectOut } = useSceneHoverContext();
  // This reference will give us direct access to the mesh
  const meshRef = useRef<ThreeMesh>(null);

  const geometry = useMemo(() => {
    if (
      !props.object.attributes.geometry ||
      props.object.attributes.geometry.length === 0
    ) {
      console.warn(`Mesh ${props.object.id} has no geometry data`);
      return new BufferGeometry();
    }

    const geometry = new BufferGeometry();
    const positions =
      props.object.attributes.geometry instanceof Float32Array
        ? props.object.attributes.geometry
        : new Float32Array(props.object.attributes.geometry);

    // Make sure we're setting position attribute with the correct itemSize (3 for xyz)
    geometry.setAttribute("position", new BufferAttribute(positions, 3));

    // Compute vertex normals
    geometry.computeVertexNormals();

    // Compute bounding box for proper scaling/positioning
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }, [props.object.attributes.geometry, props.object.id]);

  // Fixes for geometry after it's added to the scene
  useEffect(() => {
    if (meshRef.current && geometry) {
      // Ensure geometry is properly updated
      geometry.attributes.position.needsUpdate = true;
      if (geometry.attributes.normal) {
        geometry.attributes.normal.needsUpdate = true;
      }

      // Force update of matrices
      meshRef.current.updateMatrix();
      meshRef.current.updateMatrixWorld();
    }
  }, [geometry]);

  // Update the mesh every frame to ensure it renders correctly
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.updateMatrixWorld();
    }
  });

  const { position, rotation, scale } = props.object.attributes;

  return (
    <>
      {/* Render with front sides */}
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObjects([props.object.id]);
        }}
        onPointerOver={(event) => onHoverObjectIn(props.object.id)}
        onPointerOut={(event) => onHoverObjectOut(props.object.id)}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        scale={[scale.x, scale.y, scale.z]}
        castShadow
        receiveShadow
        geometry={geometry}
        userData={{
          id: props.object.id,
        }}
      >
        {props.object.attributes.material && (
          <meshStandardMaterial
            color={props.object.attributes.material.color}
            roughness={props.object.attributes.material.roughness}
            metalness={props.object.attributes.material.metalness}
            side={DoubleSide}
            flatShading={false}
            // These settings help with z-fighting and rendering artifacts
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        )}
        {!props.object.attributes.material?.color && (
          <meshStandardMaterial
            color={"orange"}
            roughness={0.7}
            metalness={0.2}
            side={DoubleSide}
            // These settings help with z-fighting and rendering artifacts
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        )}
      </mesh>
    </>
  );
}
