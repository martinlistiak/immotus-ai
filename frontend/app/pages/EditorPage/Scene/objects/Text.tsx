import { BoxHelper } from "three";
import type { TextAttributes, AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Text as DreiText } from "@react-three/drei";

// For a real TextGeometry implementation, you would need to load a font
// For now, we'll use drei's Text component which handles fonts automatically
export function Text(props: { object: AbstractSyntaxTree<TextAttributes> }) {
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
      <group
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
      >
        <DreiText
          fontSize={props.object.attributes.size || 1}
          color={props.object.attributes.material?.color || "orange"}
          maxWidth={100}
          lineHeight={1}
          textAlign="center"
          // font="/fonts/Inter-Bold.woff"
          anchorX="center"
          anchorY="middle"
        >
          {props.object.attributes.text}
        </DreiText>
      </group>
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
