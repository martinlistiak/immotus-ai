import { PivotControls, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useSceneContext } from "../Scene.context";
import { findObjectByUserData } from "app/utils/utils";
import type { Object3D } from "three";
export function ObjectTransformer({}) {
  const { activeTool, selectedObjects, dispatchScene } = useSceneContext();
  const selectedObjectsRef = useRef(selectedObjects);
  const { scene } = useThree();
  const transformRef = useRef<any>(null);
  const objectRef = useRef<THREE.Object3D | null>(null);
  const [objectToTransform, setObjectToTransform] = useState<Object3D | null>(
    null
  );
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );

  // Handle transform changes
  useEffect(() => {
    if (!transformRef.current) return;

    const controls = transformRef.current;
    let previousPosition = new THREE.Vector3();
    let previousRotation = new THREE.Euler();
    let previousScale = new THREE.Vector3(1, 1, 1);

    // Store initial values when starting to drag
    const handleMouseDown = () => {
      if (!objectRef.current) return;

      previousPosition.copy(objectRef.current.position);
      previousRotation.copy(objectRef.current.rotation);
      previousScale.copy(objectRef.current.scale);
    };

    // Update scene state when transform changes
    const handleObjectChange = () => {
      if (!objectRef.current || selectedObjects.length === 0) return;

      const object = objectRef.current;

      // Only update the properties relevant to the current transform mode
      // This prevents unintended changes to other properties
      if (mode === "translate") {
        if (!object.position.equals(previousPosition)) {
          dispatchScene({
            type: "CHANGE_OBJECT_POSITION",
            payload: {
              objectId: selectedObjects[0].id,
              position: object.position.x,
              coordinate: "x",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_POSITION",
            payload: {
              objectId: selectedObjects[0].id,
              position: object.position.y,
              coordinate: "y",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_POSITION",
            payload: {
              objectId: selectedObjects[0].id,
              position: object.position.z,
              coordinate: "z",
            },
          });

          previousPosition.copy(object.position);
        }
      } else if (mode === "rotate") {
        if (!object.rotation.equals(previousRotation)) {
          dispatchScene({
            type: "CHANGE_OBJECT_ROTATION",
            payload: {
              objectId: selectedObjects[0].id,
              rotation: object.rotation.x,
              coordinate: "x",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_ROTATION",
            payload: {
              objectId: selectedObjects[0].id,
              rotation: object.rotation.y,
              coordinate: "y",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_ROTATION",
            payload: {
              objectId: selectedObjects[0].id,
              rotation: object.rotation.z,
              coordinate: "z",
            },
          });

          previousRotation.copy(object.rotation);
        }
      } else if (mode === "scale") {
        if (!object.scale.equals(previousScale)) {
          dispatchScene({
            type: "CHANGE_OBJECT_SCALE",
            payload: {
              objectId: selectedObjects[0].id,
              scale: object.scale.x,
              coordinate: "x",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_SCALE",
            payload: {
              objectId: selectedObjects[0].id,
              scale: object.scale.y,
              coordinate: "y",
            },
          });
          dispatchScene({
            type: "CHANGE_OBJECT_SCALE",
            payload: {
              objectId: selectedObjects[0].id,
              scale: object.scale.z,
              coordinate: "z",
            },
          });

          previousScale.copy(object.scale);
        }
      }
    };

    controls.addEventListener("mouseDown", handleMouseDown);

    return () => {
      controls.removeEventListener("mouseDown", handleMouseDown);
    };
  }, [transformRef, selectedObjects, dispatchScene, mode]);

  // Find and set the selected object in the scene
  useEffect(() => {
    if (
      selectedObjects.length === 1 &&
      scene &&
      JSON.stringify(selectedObjectsRef.current) !==
        JSON.stringify(selectedObjects)
    ) {
      const firstSelectedObject = selectedObjects[0];

      const foundObject = findObjectByUserData(scene, firstSelectedObject.id)!;
      //   setObjectToTransform(foundObject);
      objectRef.current = foundObject;
    } else {
      //   setObjectToTransform(null);
      objectRef.current = null;
    }
  }, [selectedObjects]);

  console.log(objectToTransform);

  if (!objectRef.current) return null;

  return (
    <PivotControls
      ref={transformRef}
      //   onObjectChange={handleObjectChange}
      //   object={objectRef.current!}
      //   mode={mode}
      enabled={activeTool === "move"}
    />
  );
}
