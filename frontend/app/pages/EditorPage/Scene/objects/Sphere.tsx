import { BoxHelper } from "three";
import type { AbstractSyntaxTree, SphereAttributes } from "app/types/scene-ast";
import { useSceneContext } from "../Scene.context";
import { useRef } from "react";
import type { Mesh, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export function SpherePlacer({
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
    if (activeTool !== "sphere" || !planeRef.current) return;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersection with the ground plane
    const intersects = raycaster.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      let snapPosition = intersects[0].point.clone();

      // Snap to grid (round to nearest integer)
      snapPosition.x = Math.round(snapPosition.x);
      snapPosition.z = Math.round(snapPosition.z);
      snapPosition.y = 0.5; // Half the height of the box

      // Check for existing boxes to snap to
      const SNAP_THRESHOLD = 0.5;
      let closestDistance = SNAP_THRESHOLD;
      let snapToTop = false;
      let snapX = snapPosition.x;
      let snapZ = snapPosition.z;
      let snapY = snapPosition.y;

      // Use scene objects from the context
      if (scene?.objects && scene.objects.length > 0) {
        scene.objects.forEach((object) => {
          if (object.type === "box") {
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
        <meshBasicMaterial />
      </mesh>

      {/* Ghost box preview */}
      {ghostBoxPosition && activeTool === "sphere" && (
        <mesh position={ghostBoxPosition}>
          <sphereGeometry args={[1, 64, 32]} />
          <meshStandardMaterial color="orange" transparent opacity={0.5} />
        </mesh>
      )}
    </>
  );
}

export function Sphere(props: {
  object: AbstractSyntaxTree<SphereAttributes>;
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

  // Add a ref for the box helper
  const boxHelperRef = useRef<BoxHelper>(null);

  // Update the box helper position in animation frame
  useFrame(() => {
    if (meshRef.current && boxHelperRef.current) {
      boxHelperRef.current.update();
    }
  });

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
      >
        <sphereGeometry
          args={[
            props.object.attributes.radius,
            props.object.attributes.widthSegments,
            props.object.attributes.heightSegments,
            props.object.attributes.phiStart,
            props.object.attributes.phiLength,
            props.object.attributes.thetaStart,
            props.object.attributes.thetaLength,
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
      {/* Conditional box helper */}
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
