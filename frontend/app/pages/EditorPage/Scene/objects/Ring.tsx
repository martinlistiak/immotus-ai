import type { RingAttributes, AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext, useSceneHoverContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh } from "three";

export function Ring(props: { object: AbstractSyntaxTree<RingAttributes> }) {
  const { setSelectedObjects, selectedObjects } = useSceneContext();
  const { onHoverObjectIn, onHoverObjectOut, hoveredObject } =
    useSceneHoverContext();
  const meshRef = useRef<Mesh>(null);
  return (
    <>
      <mesh
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
        scale={[
          props.object.attributes.scale.x,
          props.object.attributes.scale.y,
          props.object.attributes.scale.z,
        ]}
        receiveShadow
        castShadow
        userData={{
          id: props.object.id,
        }}
      >
        <ringGeometry
          args={[
            props.object.attributes.innerRadius,
            props.object.attributes.outerRadius,
            props.object.attributes.thetaSegments || 32,
            props.object.attributes.phiSegments || 8,
            props.object.attributes.thetaStart || 0,
            props.object.attributes.thetaLength || Math.PI * 2,
          ]}
        />
        {props.object.attributes.material && (
          <meshStandardMaterial
            color={props.object.attributes.material.color}
            roughness={props.object.attributes.material.roughness}
            metalness={props.object.attributes.material.metalness}
            side={2}
          />
        )}
        {!props.object.attributes.material?.color && (
          <meshStandardMaterial
            color={"orange"}
            roughness={0.7}
            metalness={0.2}
            side={2}
          />
        )}
      </mesh>
    </>
  );
}
