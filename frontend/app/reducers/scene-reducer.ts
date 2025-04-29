import type { SceneType } from "app/types/scene-ast";
import { duplicateObjectRecursively } from "app/utils/utils";
import { produce } from "immer";
import { useEffect, useReducer, useState } from "react";
import { v4 } from "uuid";

type AddObjectAction = {
  type: "ADD_OBJECT";
  payload: {
    object: SceneType["objects"][number];
  };
};

type ChangeObjectPositionAction = {
  type: "CHANGE_OBJECT_POSITION";
  payload: {
    objectId: string;
    position: number;
    coordinate: "x" | "y" | "z";
  };
};

type ChangeObjectRotationAction = {
  type: "CHANGE_OBJECT_ROTATION";
  payload: {
    objectId: string;
    rotation: number;
    coordinate: "x" | "y" | "z";
  };
};

type ChangeObjectScaleAction = {
  type: "CHANGE_OBJECT_SCALE";
  payload: {
    objectId: string;
    scale: number;
    coordinate: "x" | "y" | "z";
  };
};

type ChangeLightColorAction = {
  type: "CHANGE_LIGHT_COLOR";
  payload: {
    objectId: string;
    color: string;
  };
};

type ChangeLightIntensityAction = {
  type: "CHANGE_LIGHT_INTENSITY";
  payload: {
    objectId: string;
    intensity: number;
  };
};

type ChangeLightDistanceAction = {
  type: "CHANGE_LIGHT_DISTANCE";
  payload: {
    objectId: string;
    distance: number;
  };
};

type ChangeLightDecayAction = {
  type: "CHANGE_LIGHT_DECAY";
  payload: {
    objectId: string;
    decay: number;
  };
};

type SetSceneAction = {
  type: "SET_SCENE";
  payload: {
    scene: SceneType;
  };
};

type RemoveObjectsAction = {
  type: "REMOVE_OBJECTS";
  payload: {
    objectIds: string[];
  };
};

type RenameObjectAction = {
  type: "RENAME_OBJECT";
  payload: {
    objectId: string;
    name: string;
  };
};

type DuplicateObjectAction = {
  type: "DUPLICATE_OBJECT";
  payload: {
    objectId: string;
  };
};

type GroupObjectsAction = {
  type: "GROUP_OBJECTS";
  payload: {
    objectIds: string[];
  };
};

type ChangeObjectMetalnessAction = {
  type: "CHANGE_OBJECT_METALNESS";
  payload: {
    objectId: string;
    metalness: number;
  };
};

type ChangeObjectRoughnessAction = {
  type: "CHANGE_OBJECT_ROUGHNESS";
  payload: {
    objectId: string;
    roughness: number;
  };
};

type ChangeObjectColorAction = {
  type: "CHANGE_OBJECT_COLOR";
  payload: {
    objectId: string;
    color: string;
  };
};

type ChangePlanePropertyAction = {
  type: "CHANGE_PLANE_PROPERTY";
  payload: {
    objectId: string;
    property: "width" | "height" | "widthSegments" | "heightSegments";
    value: number;
  };
};

type ChangeSpherePropertyAction = {
  type: "CHANGE_SPHERE_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "radius"
      | "widthSegments"
      | "heightSegments"
      | "phiStart"
      | "phiLength"
      | "thetaStart"
      | "thetaLength";
    value: number;
  };
};

type ChangeCylinderPropertyAction = {
  type: "CHANGE_CYLINDER_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "radiusTop"
      | "radiusBottom"
      | "height"
      | "radialSegments"
      | "heightSegments"
      | "openEnded"
      | "thetaStart"
      | "thetaLength";
    value: number | boolean;
  };
};

type ChangeConePropertyAction = {
  type: "CHANGE_CONE_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "radius"
      | "height"
      | "radialSegments"
      | "heightSegments"
      | "openEnded"
      | "thetaStart"
      | "thetaLength";
    value: number | boolean;
  };
};

type ChangeTorusPropertyAction = {
  type: "CHANGE_TORUS_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "tube" | "radialSegments" | "tubularSegments" | "arc";
    value: number;
  };
};

type ChangeCirclePropertyAction = {
  type: "CHANGE_CIRCLE_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "segments" | "thetaStart" | "thetaLength";
    value: number;
  };
};

type ChangeRingPropertyAction = {
  type: "CHANGE_RING_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "innerRadius"
      | "outerRadius"
      | "thetaSegments"
      | "phiSegments"
      | "thetaStart"
      | "thetaLength";
    value: number;
  };
};

type ChangeDodecahedronPropertyAction = {
  type: "CHANGE_DODECAHEDRON_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "detail";
    value: number;
  };
};

type ChangeIcosahedronPropertyAction = {
  type: "CHANGE_ICOSAHEDRON_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "detail";
    value: number;
  };
};

type ChangeOctahedronPropertyAction = {
  type: "CHANGE_OCTAHEDRON_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "detail";
    value: number;
  };
};

type ChangeTetrahedronPropertyAction = {
  type: "CHANGE_TETRAHEDRON_PROPERTY";
  payload: {
    objectId: string;
    property: "radius" | "detail";
    value: number;
  };
};

type ChangeTorusKnotPropertyAction = {
  type: "CHANGE_TORUSKNOT_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "radius"
      | "tube"
      | "tubularSegments"
      | "radialSegments"
      | "p"
      | "q";
    value: number;
  };
};

type ChangeTextPropertyAction = {
  type: "CHANGE_TEXT_PROPERTY";
  payload: {
    objectId: string;
    property:
      | "text"
      | "size"
      | "height"
      | "curveSegments"
      | "bevelThickness"
      | "bevelSize"
      | "bevelSegments";
    value: number | string | boolean;
  };
};

type MoveObjectInTreeAction = {
  type: "MOVE_OBJECT_IN_TREE";
  payload: {
    objectId: string;
    parentId: string;
  };
};
export type Action =
  | (
      | ChangeObjectPositionAction
      | ChangeObjectRotationAction
      | ChangeObjectScaleAction
      | ChangeLightColorAction
      | ChangeLightIntensityAction
      | ChangeLightDistanceAction
      | ChangeLightDecayAction
      | AddObjectAction
      | SetSceneAction
      | RemoveObjectsAction
      | RenameObjectAction
      | DuplicateObjectAction
      | GroupObjectsAction
      | ChangeObjectMetalnessAction
      | ChangeObjectRoughnessAction
      | ChangeObjectColorAction
      | ChangePlanePropertyAction
      | ChangeSpherePropertyAction
      | ChangeCylinderPropertyAction
      | ChangeConePropertyAction
      | ChangeTorusPropertyAction
      | ChangeCirclePropertyAction
      | ChangeRingPropertyAction
      | ChangeDodecahedronPropertyAction
      | ChangeIcosahedronPropertyAction
      | ChangeOctahedronPropertyAction
      | ChangeTetrahedronPropertyAction
      | ChangeTorusKnotPropertyAction
      | ChangeTextPropertyAction
      | MoveObjectInTreeAction
    ) & { skipHistory?: boolean };

export const initialScene: SceneType = {
  id: "",
  name: "Default Scene",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  objects: [
    {
      id: "1",
      type: "box",
      parentId: null,
      attributes: {
        name: "Default Object",
        description: "",
        position: {
          x: 0,
          y: 2.5,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        scale: {
          x: 5,
          y: 5,
          z: 5,
        },
        material: {
          color: "#FFA500",
          roughness: 0.7,
          metalness: 0.2,
        },
      },
    },
    {
      id: "2",
      type: "light",
      parentId: null,
      attributes: {
        name: "Default Light",
        description: "",
        position: {
          x: 0,
          y: 10,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
        intensity: 1,
        color: "#ffffff",
        distance: 1000,
        decay: 0.2,
      },
    },
  ],
};

export const sceneReducer = (state: SceneType, action: Action) => {
  switch (action.type) {
    case "SET_SCENE":
      return action.payload.scene;
    case "ADD_OBJECT":
      return produce(state, (draft) => {
        draft.objects.push(action.payload.object);
      });

    case "CHANGE_OBJECT_POSITION":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          object.attributes.position[action.payload.coordinate] =
            action.payload.position;
        }
      });
    case "CHANGE_OBJECT_ROTATION":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          object.attributes.rotation[action.payload.coordinate] =
            action.payload.rotation;
        }
      });
    case "CHANGE_OBJECT_SCALE":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          object.attributes.scale[action.payload.coordinate] =
            action.payload.scale;
        }
      });
    case "CHANGE_LIGHT_COLOR":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "color" in object.attributes) {
          object.attributes.color = action.payload.color;
        }
      });
    case "CHANGE_LIGHT_INTENSITY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "intensity" in object.attributes) {
          object.attributes.intensity = action.payload.intensity;
        }
      });
    case "CHANGE_LIGHT_DISTANCE":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "distance" in object.attributes) {
          object.attributes.distance = action.payload.distance;
        }
      });
    case "CHANGE_LIGHT_DECAY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "decay" in object.attributes) {
          object.attributes.decay = action.payload.decay;
        }
      });
    case "REMOVE_OBJECTS":
      return produce(state, (draft) => {
        // Helper function to get all descendant IDs of an object
        const getDescendantIds = (objectId: string): string[] => {
          const children = draft.objects.filter(
            (obj) => obj.parentId === objectId
          );
          return [
            objectId,
            ...children.flatMap((child) => getDescendantIds(child.id)),
          ];
        };

        // Get all objects to remove including their descendants
        const allObjectsToRemove = action.payload.objectIds.flatMap((id) =>
          getDescendantIds(id)
        );

        // Set parentId to null for all objects being removed
        const objectsToRemove = draft.objects.filter((object) =>
          allObjectsToRemove.includes(object.id)
        );
        for (const object of objectsToRemove) {
          object.parentId = null;
        }

        // Remove all objects including their descendants
        draft.objects = draft.objects.filter(
          (object) => !allObjectsToRemove.includes(object.id)
        );
      });
    case "RENAME_OBJECT":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          object.attributes.name = action.payload.name;
        }
      });
    case "DUPLICATE_OBJECT":
      return produce(state, (draft) => {
        const duplicates = duplicateObjectRecursively(
          action.payload.objectId,
          draft.objects
        ).map((d) =>
          !d.parentId
            ? {
                ...d,
                attributes: {
                  ...d.attributes,
                  name: `${d.attributes.name} (Copy)`,
                },
              }
            : d
        );

        console.log(duplicates);

        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          // splice the object at the index of the object
          // duplicate also the children recursively
          draft.objects.splice(
            draft.objects.indexOf(object) + 1,
            0,
            ...duplicates
          );
        }
      });
    case "GROUP_OBJECTS":
      return produce(state, (draft) => {
        const objects = draft.objects.filter((object) =>
          action.payload.objectIds.includes(object.id)
        );
        const group = {
          id: v4(),
          type: "group" as const,
          parentId: null,
          attributes: {
            name: "Group",
            description: "",
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
        };
        draft.objects.splice(
          draft.objects.indexOf(objects[0]) + 1,
          0,
          group as any
        );
        for (const object of objects) {
          object.parentId = group.id;
        }
      });
    case "CHANGE_OBJECT_METALNESS":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "material" in object.attributes) {
          object.attributes.material.metalness = action.payload.metalness;
        }
      });
    case "CHANGE_OBJECT_ROUGHNESS":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "material" in object.attributes) {
          object.attributes.material.roughness = action.payload.roughness;
        }
      });
    case "CHANGE_OBJECT_COLOR":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && "material" in object.attributes) {
          object.attributes.material.color = action.payload.color;
        }
      });
    case "CHANGE_PLANE_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "plane") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_SPHERE_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "sphere") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_CYLINDER_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "cylinder") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_CONE_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "cone") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_TORUS_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "torus") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_CIRCLE_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "circle") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_RING_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "ring") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_DODECAHEDRON_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "dodecahedron") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_ICOSAHEDRON_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "icosahedron") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_OCTAHEDRON_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "octahedron") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_TETRAHEDRON_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "tetrahedron") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_TORUSKNOT_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "torusknot") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "CHANGE_TEXT_PROPERTY":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object && object.type === "text") {
          (object.attributes as any)[action.payload.property] =
            action.payload.value;
        }
      });
    case "MOVE_OBJECT_IN_TREE":
      return produce(state, (draft) => {
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          object.parentId = action.payload.parentId;
        }
      });
    default:
      return state;
  }
};

let cb: ((state: SceneType) => void) | null = null;

export const useSceneReducer = () => {
  const [scene, dispatch] = useReducer(sceneReducer, initialScene);

  useEffect(() => {
    cb && cb(scene);
  }, [scene]);

  return [
    scene,
    (action: Action, callback: typeof cb) => {
      cb = callback;
      dispatch(action);
    },
  ] as const;
};
