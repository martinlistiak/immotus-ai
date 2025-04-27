import { BufferAttribute, BufferGeometry } from "three";

import type { MeshAttributes } from "app/types/scene-ast";

import type { AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext, useSceneHoverContext } from "../Scene.context";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

export function MeshComponent(props: {
  object: AbstractSyntaxTree<MeshAttributes>;
}) {
  const { setSelectedObjects } = useSceneContext();
  const { onHoverObjectIn, onHoverObjectOut } = useSceneHoverContext();
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null);

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
        userData={{
          id: props.object.id,
        }}
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
    </>
  );
}
