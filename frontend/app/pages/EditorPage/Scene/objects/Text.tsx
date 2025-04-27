import type { TextAttributes, AbstractSyntaxTree } from "app/types/scene-ast";
import { useSceneContext, useSceneHoverContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh } from "three";
import { Text as DreiText } from "@react-three/drei";

// For a real TextGeometry implementation, you would need to load a font
// For now, we'll use drei's Text component which handles fonts automatically
export function Text(props: { object: AbstractSyntaxTree<TextAttributes> }) {
  const { setSelectedObjects, selectedObjects } = useSceneContext();
  const { onHoverObjectIn, onHoverObjectOut } = useSceneHoverContext();
  const meshRef = useRef<Mesh>(null);

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
        userData={{
          id: props.object.id,
        }}
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
    </>
  );
}
