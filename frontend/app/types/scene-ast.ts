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
  radius?: number | undefined;
  widthSegments?: number | undefined;
  heightSegments?: number | undefined;
  phiStart?: number | undefined;
  phiLength?: number | undefined;
  thetaStart?: number | undefined;
  thetaLength?: number | undefined;
};

export type PlaneAttributes = BaseObjectWithMaterialAttributes & {
  width: number;
  height: number;
  widthSegments?: number;
  heightSegments?: number;
};

export type CylinderAttributes = BaseObjectWithMaterialAttributes & {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
};

export type ConeAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  height: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
};

export type TorusAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  tube: number;
  radialSegments?: number;
  tubularSegments?: number;
  arc?: number;
};

export type CircleAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  segments?: number;
  thetaStart?: number;
  thetaLength?: number;
};

export type RingAttributes = BaseObjectWithMaterialAttributes & {
  innerRadius: number;
  outerRadius: number;
  thetaSegments?: number;
  phiSegments?: number;
  thetaStart?: number;
  thetaLength?: number;
};

export type DodecahedronAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  detail?: number;
};

export type IcosahedronAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  detail?: number;
};

export type OctahedronAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  detail?: number;
};

export type TetrahedronAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  detail?: number;
};

export type TorusKnotAttributes = BaseObjectWithMaterialAttributes & {
  radius: number;
  tube: number;
  tubularSegments?: number;
  radialSegments?: number;
  p?: number;
  q?: number;
};

export type TextAttributes = BaseObjectWithMaterialAttributes & {
  text: string;
  size?: number;
  height?: number;
  curveSegments?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
};

export type LightAttributes = BaseObjectAttributes & {
  intensity: number;
  color: string;
  distance: number;
  decay: number;
};

export type MeshAttributes = BaseObjectWithMaterialAttributes & {
  geometry: number[]; // Float32Array
};

export type ObjectAttributes =
  | BoxAttributes
  | SphereAttributes
  | PlaneAttributes
  | CylinderAttributes
  | ConeAttributes
  | TorusAttributes
  | CircleAttributes
  | RingAttributes
  | DodecahedronAttributes
  | IcosahedronAttributes
  | OctahedronAttributes
  | TetrahedronAttributes
  | TorusKnotAttributes
  | TextAttributes
  | LightAttributes
  | MeshAttributes;

export type ObjectType =
  | "box"
  | "sphere"
  | "plane"
  | "cylinder"
  | "cone"
  | "torus"
  | "circle"
  | "ring"
  | "dodecahedron"
  | "icosahedron"
  | "octahedron"
  | "tetrahedron"
  | "torusknot"
  | "text"
  | "light"
  | "mesh"
  | "group";

export type AbstractSyntaxTree<T extends SceneAttributes | ObjectAttributes> = {
  id: string;
  type: ObjectType;
  attributes: T;
  parentId: string | null;
};

export type SceneObjects = AbstractSyntaxTree<ObjectAttributes>[];
export type SceneType = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  objects: SceneObjects;
  ambientLightIntensity: number;
  ambientLightColor: string;
  showGrid: boolean;
  backgroundColor: string;
  // environment: "studio" | "outdoor";
};

export type SceneTool =
  | "box"
  | "move"
  | "select"
  | "light"
  | "sphere"
  | "plane"
  | "cylinder"
  | "cone"
  | "torus"
  | "circle"
  | "ring"
  | "dodecahedron"
  | "icosahedron"
  | "octahedron"
  | "tetrahedron"
  | "torusknot"
  | "text";

export enum CameraType {
  THREE_D = "3d camera",
  TWO_D = "2d camera",
}
