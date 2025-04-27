import type { AbstractSyntaxTree, LightAttributes } from "app/types/scene-ast";
import { useSceneContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export function LightPlacer({
  setGhostBoxPosition,
  ghostBoxPosition,
}: {
  setGhostBoxPosition: (position: Vector3) => void;
  ghostBoxPosition: Vector3 | null;
}) {
  const { activeTool, scene } = useSceneContext();
  const { camera, raycaster, mouse } = useThree();
  const planeRef = useRef<Mesh>(null);

  useFrame(() => {
    if (activeTool !== "light" || !planeRef.current) return;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersection with the ground plane
    const intersects = raycaster.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      let snapPosition = intersects[0].point.clone();

      // Snap to grid (round to nearest integer)
      snapPosition.x = Math.round(snapPosition.x);
      snapPosition.z = Math.round(snapPosition.z);
      snapPosition.y = 10;

      // Check for existing boxes to snap to
      const SNAP_THRESHOLD = 1.5;
      let closestDistance = SNAP_THRESHOLD;
      let snapToTop = false;
      let snapX = snapPosition.x;
      let snapZ = snapPosition.z;
      let snapY = snapPosition.y;

      // Use scene objects from the context
      if (scene?.objects && scene.objects.length > 0) {
        scene.objects.forEach((object) => {
          if (object.type === "light") {
            const objPos = object.attributes.position;
            const objScale = object.attributes.scale;

            // Calculate horizontal distance (ignoring Y axis)
            const horizontalDistance = Math.sqrt(
              Math.pow(snapPosition.x - objPos.x, 2) +
                Math.pow(snapPosition.z - objPos.z, 2)
            );

            // If we're directly above an object (horizontally close)
            if (horizontalDistance < 0.5) {
              // We want to place on top of this object
              snapToTop = true;
              snapX = objPos.x;
              snapZ = objPos.z;
              snapY = objPos.y + objScale.y / 2 + 0.5; // Top of box + half of new box height
              closestDistance = horizontalDistance;
            }
            // Otherwise check if we're close enough to snap horizontally
            else if (horizontalDistance < closestDistance) {
              snapX = objPos.x;
              snapZ = objPos.z;
              snapY = objPos.y; // Same height
              closestDistance = horizontalDistance;
              snapToTop = false;
            }
          }
        });
      }

      // Apply snapping
      snapPosition.x = snapX;
      snapPosition.z = snapZ;
      snapPosition.y = snapY;

      setGhostBoxPosition(snapPosition);
    }
  });

  return (
    <>
      {/* Invisible plane for raycasting */}
      <mesh
        ref={planeRef}
        visible={false}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        {/* <meshBasicMaterial color="red" /> */}
      </mesh>

      {/* Ghost box preview */}
      {ghostBoxPosition && activeTool === "light" && (
        <>
          <pointLight
            position={[
              ghostBoxPosition.x,
              ghostBoxPosition.y,
              ghostBoxPosition.z,
            ]}
            intensity={1}
            color="#ffffff"
            distance={1000}
            decay={0.2}
            castShadow
          />
        </>
      )}
    </>
  );
}

export function Light(props: { object: AbstractSyntaxTree<LightAttributes> }) {
  return (
    <>
      <pointLight
        position={[
          props.object.attributes.position.x,
          props.object.attributes.position.y,
          props.object.attributes.position.z,
        ]}
        intensity={props.object.attributes.intensity * 3}
        color={props.object.attributes.color}
        distance={props.object.attributes.distance}
        decay={props.object.attributes.decay}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
        userData={{
          id: props.object.id,
        }}
      />
    </>
  );
}
