import type { SceneType } from "app/types/scene-ast";
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

type RemoveObjectAction = {
  type: "REMOVE_OBJECT";
  payload: {
    objectId: string;
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
      | RemoveObjectAction
      | RenameObjectAction
      | DuplicateObjectAction
      | GroupObjectsAction
      | ChangeObjectMetalnessAction
      | ChangeObjectRoughnessAction
      | ChangeObjectColorAction
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
    case "REMOVE_OBJECT":
      return produce(state, (draft) => {
        draft.objects = draft.objects.filter(
          (object) => object.id !== action.payload.objectId
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
        const object = draft.objects.find(
          (object) => object.id === action.payload.objectId
        );
        if (object) {
          draft.objects.push({
            ...object,
            id: v4(),
            attributes: {
              ...object.attributes,
              name: `${object.attributes.name} (Copy)`,
            },
          });
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
        draft.objects.push(group as any);
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
