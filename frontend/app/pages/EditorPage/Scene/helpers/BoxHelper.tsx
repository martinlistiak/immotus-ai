import { useSceneContext } from "../Scene.context";
import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Mesh, Object3D, Scene } from "three";
import { useSceneHoverContext } from "../Scene.context";

function findObjectByUserData(scene: Scene, value: string) {
  let element: Object3D | undefined;
  scene.traverse((child) => {
    if (child.userData?.id === value) {
      element = child;
    }
  });
  return element;
}

export function BoxHelper() {
  const { scene: threeScene } = useThree();
  const { selectedObjects, scene } = useSceneContext();
  const { hoveredObject } = useSceneHoverContext();

  const selectedObjectElements = useMemo(() => {
    return selectedObjects.map((object) => {
      return findObjectByUserData(threeScene, object.id);
    });
  }, [scene, selectedObjects]);

  const hoveredObjectElement = useMemo(() => {
    if (!hoveredObject) return null;
    return findObjectByUserData(threeScene, hoveredObject.id);
  }, [scene, hoveredObject]);
  return (
    <>
      {selectedObjectElements
        .filter((element) => !!element)
        .map((element) => {
          return (
            <boxHelper
              key={element.id}
              args={[element as Mesh, "rgb(37, 137, 255)"]}
            />
          );
        })}
      {hoveredObjectElement && (
        <boxHelper args={[hoveredObjectElement as Mesh, "rgb(37, 137, 255)"]} />
      )}
    </>
  );
}
