export type SceneAttributes = {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type BaseObjectAttributes = {
  name: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
};

export type BaseObjectWithMaterialAttributes = BaseObjectAttributes & {
  material: {
    color: string;
    roughness: number;
    metalness: number;
  };
};

export type BoxAttributes = BaseObjectWithMaterialAttributes & {};

export type SphereAttributes = BaseObjectWithMaterialAttributes & {
  // radius: number;
};

export type MeshAttributes = BaseObjectWithMaterialAttributes & {
  geometry: number[]; // Float32Array
};
export type LightAttributes = BaseObjectAttributes & {
  intensity: number;
  color: string;
  distance: number;
  decay: number;
};

export type ObjectAttributes = BoxAttributes | LightAttributes | MeshAttributes;

export type ObjectType = "box" | "light" | "group" | "mesh" | "sphere";

export type AbstractSyntaxTree<T extends SceneAttributes | ObjectAttributes> = {
  id: string;
  type: ObjectType;
  attributes: T;
  parentId: string | null;
};

export type SceneType = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  objects: AbstractSyntaxTree<ObjectAttributes>[];
};

export type SceneTool = "box" | "move" | "select" | "light" | "sphere";
