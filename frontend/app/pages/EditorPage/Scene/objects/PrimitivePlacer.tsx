import { useRef } from "react";
import type { Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSceneContext } from "../Scene.context";
import type { SceneTool } from "app/types/scene-ast";
import {
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  CylinderGeometry,
  ConeGeometry,
} from "three";
import { CameraType } from "app/types/scene-ast";

interface PrimitivePlacerProps {
  setGhostPosition: (position: Vector3) => void;
  ghostPosition: Vector3 | null;
  primitive: SceneTool;
}

export function PrimitivePlacer({
  setGhostPosition,
  ghostPosition,
  primitive,
}: PrimitivePlacerProps) {
  const { activeTool, scene, activeCamera } = useSceneContext();
  const { camera, raycaster, mouse } = useThree();
  const planeRef = useRef<Mesh>(null);
  const isTechnicalDrawing = activeCamera === CameraType.TWO_D;

  useFrame(() => {
    if (activeTool !== primitive || !planeRef.current) return;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersection with the ground plane
    const intersects = raycaster.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      let snapPosition = intersects[0].point.clone();

      // Snap to grid (round to nearest integer)
      snapPosition.x = Math.round(snapPosition.x);
      snapPosition.z = Math.round(snapPosition.z);

      // Set default Y based on primitive type
      if (primitive === "light") {
        snapPosition.y = 10; // Lights are placed higher
      } else {
        snapPosition.y = 0.5; // Half the height of the primitive
      }

      // Check for existing objects to snap to
      const SNAP_THRESHOLD = 0.5;
      let closestDistance = SNAP_THRESHOLD;
      let snapToTop = false;
      let snapX = snapPosition.x;
      let snapZ = snapPosition.z;
      let snapY = snapPosition.y;

      // Use scene objects from the context
      if (scene?.objects && scene.objects.length > 0) {
        scene.objects.forEach((object) => {
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
            snapY = objPos.y + objScale.y / 2 + 0.5; // Top of object + half of new primitive height
            closestDistance = horizontalDistance;
          }
          // Otherwise check if we're close enough to snap horizontally
          else if (horizontalDistance < closestDistance) {
            snapX = objPos.x;
            snapZ = objPos.z;
            snapY = snapPosition.y; // Same height
            closestDistance = horizontalDistance;
            snapToTop = false;
          }
        });
      }

      // Apply snapping
      snapPosition.x = snapX;
      snapPosition.z = snapZ;
      snapPosition.y = snapY;

      setGhostPosition(snapPosition);
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
        <meshBasicMaterial />
      </mesh>

      {/* Ghost preview based on primitive type */}
      {ghostPosition && activeTool === primitive && (
        <>
          {/* Different preview meshes based on primitive type */}
          {primitive === "box" &&
            (isTechnicalDrawing ? (
              <group position={ghostPosition}>
                <mesh visible={false}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new BoxGeometry(1, 1, 1)]} />
                  <lineBasicMaterial color="black" />
                </lineSegments>
              </group>
            ) : (
              <mesh position={ghostPosition}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color="orange"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          {primitive === "sphere" &&
            (isTechnicalDrawing ? (
              <group position={ghostPosition}>
                <mesh visible={false}>
                  <sphereGeometry args={[0.5, 32, 16]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new SphereGeometry(0.5, 32, 16)]} />
                  <lineBasicMaterial color="black" />
                </lineSegments>
              </group>
            ) : (
              <mesh position={ghostPosition}>
                <sphereGeometry args={[0.5, 32, 16]} />
                <meshStandardMaterial
                  color="orange"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          {primitive === "plane" &&
            (isTechnicalDrawing ? (
              <group position={ghostPosition} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh visible={false}>
                  <planeGeometry args={[1, 1]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new PlaneGeometry(1, 1)]} />
                  <lineBasicMaterial color="black" />
                </lineSegments>
              </group>
            ) : (
              <mesh position={ghostPosition} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                  color="orange"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          {primitive === "cylinder" &&
            (isTechnicalDrawing ? (
              <group position={ghostPosition}>
                <mesh visible={false}>
                  <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry
                    args={[new CylinderGeometry(0.5, 0.5, 1, 32)]}
                  />
                  <lineBasicMaterial color="black" />
                </lineSegments>
              </group>
            ) : (
              <mesh position={ghostPosition}>
                <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
                <meshStandardMaterial
                  color="orange"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          {primitive === "cone" &&
            (isTechnicalDrawing ? (
              <group position={ghostPosition}>
                <mesh visible={false}>
                  <coneGeometry args={[0.5, 1, 32]} />
                  <meshBasicMaterial visible={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new ConeGeometry(0.5, 1, 32)]} />
                  <lineBasicMaterial color="black" />
                </lineSegments>
              </group>
            ) : (
              <mesh position={ghostPosition}>
                <coneGeometry args={[0.5, 1, 32]} />
                <meshStandardMaterial
                  color="orange"
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}
          {primitive === "light" && (
            <pointLight
              position={[ghostPosition.x, ghostPosition.y, ghostPosition.z]}
              intensity={1}
              color="#ffffff"
              distance={1000}
              decay={0.2}
            />
          )}
        </>
      )}
    </>
  );
}
