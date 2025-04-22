import { BoxHelper } from "three";
import type { TorusAttributes, AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

export function Torus(props: { object: AbstractSyntaxTree<TorusAttributes> }) {
  const {
    setSelectedObjects,
    selectedObjects,
    onHoverObjectIn,
    onHoverObjectOut,
    hoveredObject,
  } = useSceneContext();
  const meshRef = useRef<Mesh>(null);
  const isHovered = hoveredObject?.id === props.object.id;
  const boxHelperRef = useRef<BoxHelper>(null);
  useFrame(() => {
    if (meshRef.current && boxHelperRef.current) {
      boxHelperRef.current.update();
    }
  });
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
      >
        <torusGeometry
          args={[
            props.object.attributes.radius,
            props.object.attributes.tube,
            props.object.attributes.radialSegments || 16,
            props.object.attributes.tubularSegments || 100,
            props.object.attributes.arc || Math.PI * 2,
          ]}
        />
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
      {(isHovered ||
        selectedObjects.some((object) => object.id === props.object.id)) &&
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
    </>
  );
}
