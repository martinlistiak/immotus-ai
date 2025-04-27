import { Color } from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Mesh,
  LineSegments,
  LineBasicMaterial,
  EdgesGeometry,
  Group,
  Object3D,
} from "three";
import { useSceneContext } from "../Scene.context";

function LineDrawingLayer() {
  const { scene } = useThree();
  const { scene: sceneData } = useSceneContext();
  const lines = useRef<LineSegments[]>([]);

  // When scene objects change, we need to update our line drawings
  useEffect(() => {
    // Clear existing lines
    scene.traverse((obj) => {
      if (obj.userData && obj.userData.isOutlineLine) {
        if (obj.parent) {
          obj.parent.remove(obj);
        } else {
          scene.remove(obj);
        }
      }
    });

    // Reset our lines array
    lines.current = [];

    // Add new lines
    scene.traverse((obj) => {
      if (obj instanceof Mesh && obj.geometry) {
        const edges = new EdgesGeometry(obj.geometry);
        const line = new LineSegments(
          edges,
          new LineBasicMaterial({
            color: "black",
            linewidth: 1.5, // Note: THREE.js has limitations with line width
          })
        );

        // Copy local transform from the original mesh
        line.position.copy(obj.position);
        line.rotation.copy(obj.rotation);
        line.scale.copy(obj.scale);

        // Track this as an outline line
        line.userData = { isOutlineLine: true, originalMesh: obj };

        // Add to the same parent as the original mesh to maintain hierarchical transformations
        if (obj.parent) {
          obj.parent.add(line);
        } else {
          scene.add(line);
        }

        lines.current.push(line);
      }
    });

    return () => {
      // Cleanup on unmount
      lines.current.forEach((line) => {
        if (line.parent) {
          line.parent.remove(line);
        } else {
          scene.remove(line);
        }
      });
      lines.current = [];
    };
  }, [scene, sceneData?.objects]); // Re-run when scene objects change

  return null;
}

export function TechnicalDrawingView() {
  const { scene } = useThree();
  const { scene: sceneData } = useSceneContext();

  useEffect(() => {
    // Hide all regular meshes and show only outlines
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.visible = false;
      }
    });

    // Set background to white for technical drawing look
    scene.background = new Color(0xffffff);

    return () => {
      // Restore visibility when unmounted
      scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.visible = true;
        }
      });
    };
  }, [scene, sceneData?.objects]); // Also re-run when scene objects change

  return <LineDrawingLayer />;
}
