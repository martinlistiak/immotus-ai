import type { ObjectAttributes } from "app/types/scene-ast";
import type { AbstractSyntaxTree } from "app/types/scene-ast";
import type { Scene } from "three";
import type { Object3D } from "three";
import { v4 } from "uuid";

export const findChildren = (
  objects: AbstractSyntaxTree<ObjectAttributes>[],
  parentId: string
) => {
  return objects.filter((object) => object.parentId === parentId);
};

export const findChildrenRecursively = (
  objects: AbstractSyntaxTree<ObjectAttributes>[],
  parentId: string
): AbstractSyntaxTree<ObjectAttributes>[] => {
  const children = findChildren(objects, parentId);
  return children.flatMap((child) => {
    const grandChildren = findChildrenRecursively(objects, child.id);
    return [child, ...grandChildren];
  });
};

/**
 * Duplicate an object and all its children recursively
 * @param objectId - The id of the object to duplicate
 * @param objects - The array of objects to duplicate
 * @returns The duplicated object and its children in an array
 */
export const duplicateObjectRecursively = (
  objectId: string,
  objects: AbstractSyntaxTree<ObjectAttributes>[]
): AbstractSyntaxTree<ObjectAttributes>[] => {
  const object = objects.find((object) => object.id === objectId);
  const newId = v4();
  const duplicate = {
    ...object,
    id: newId,
  } as AbstractSyntaxTree<ObjectAttributes>;
  if (!object) return [];
  const children = findChildren(objects, objectId);

  const duplicateChildren = children.flatMap((child) =>
    duplicateObjectRecursively(
      child.id,
      objects.map((c) => ({
        ...c,
        ...(c.parentId === objectId && { parentId: newId }),
      }))
    )
  );

  const uniqueChildren = new Set([duplicate, ...duplicateChildren]);
  const uniqueChildrenArray = Array.from(uniqueChildren);
  return uniqueChildrenArray;
};

/**
 * Check if a color is valid
 * @param color - The color to check
 * @returns True if the color is valid, false otherwise
 */
export const isValidColor = (color: string) => {
  return /^#([0-9a-fA-F]{6})$/.test(color);
};

export const findObjectByUserData = (scene: Scene, value: string) => {
  let element: Object3D | undefined;
  scene.traverse((child: Object3D) => {
    if (child.userData?.id === value) {
      element = child;
    }
  });
  return element;
};
