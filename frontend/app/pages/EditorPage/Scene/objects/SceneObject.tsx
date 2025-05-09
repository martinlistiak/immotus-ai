import { Box } from "./Box";
import { Sphere } from "./Sphere";
import { Light } from "./Light";
import { MeshComponent } from "./Mesh";
import { GroupComponent } from "./Group";
import { Plane } from "./Plane";
import { Cylinder } from "./Cylinder";
import { Cone } from "./Cone";
import { Torus } from "./Torus";
import { Circle } from "./Circle";
import { Ring } from "./Ring";
import { Dodecahedron } from "./Dodecahedron";
import { Icosahedron } from "./Icosahedron";
import type {
  AbstractSyntaxTree,
  ObjectAttributes,
  BoxAttributes,
  SphereAttributes,
  LightAttributes,
  MeshAttributes,
  PlaneAttributes,
  CylinderAttributes,
  ConeAttributes,
  TorusAttributes,
  CircleAttributes,
  RingAttributes,
  DodecahedronAttributes,
  IcosahedronAttributes,
  OctahedronAttributes,
  TetrahedronAttributes,
  TorusKnotAttributes,
  TextAttributes,
} from "app/types/scene-ast";
import { Octahedron } from "./Octahedron";
import { Tetrahedron } from "./Tetrahedron";
import { TorusKnot } from "./TorusKnot";
import { Text } from "./Text";

export const SceneObject = ({
  object,
}: {
  object: AbstractSyntaxTree<ObjectAttributes>;
}) => {
  return (
    <>
      {object.type === "box" && (
        <Box object={object as AbstractSyntaxTree<BoxAttributes>} />
      )}
      {object.type === "sphere" && (
        <Sphere object={object as AbstractSyntaxTree<SphereAttributes>} />
      )}
      {object.type === "light" && (
        <Light object={object as AbstractSyntaxTree<LightAttributes>} />
      )}
      {object.type === "mesh" && (
        <MeshComponent object={object as AbstractSyntaxTree<MeshAttributes>} />
      )}
      {object.type === "group" && <GroupComponent object={object} />}
      {object.type === "plane" && (
        <Plane object={object as AbstractSyntaxTree<PlaneAttributes>} />
      )}
      {object.type === "cylinder" && (
        <Cylinder object={object as AbstractSyntaxTree<CylinderAttributes>} />
      )}
      {object.type === "cone" && (
        <Cone object={object as AbstractSyntaxTree<ConeAttributes>} />
      )}
      {object.type === "torus" && (
        <Torus object={object as AbstractSyntaxTree<TorusAttributes>} />
      )}
      {object.type === "circle" && (
        <Circle object={object as AbstractSyntaxTree<CircleAttributes>} />
      )}
      {object.type === "ring" && (
        <Ring object={object as AbstractSyntaxTree<RingAttributes>} />
      )}
      {object.type === "dodecahedron" && (
        <Dodecahedron
          object={object as AbstractSyntaxTree<DodecahedronAttributes>}
        />
      )}
      {object.type === "icosahedron" && (
        <Icosahedron
          object={object as AbstractSyntaxTree<IcosahedronAttributes>}
        />
      )}
      {object.type === "octahedron" && (
        <Octahedron
          object={object as AbstractSyntaxTree<OctahedronAttributes>}
        />
      )}
      {object.type === "tetrahedron" && (
        <Tetrahedron
          object={object as AbstractSyntaxTree<TetrahedronAttributes>}
        />
      )}
      {object.type === "torusknot" && (
        <TorusKnot object={object as AbstractSyntaxTree<TorusKnotAttributes>} />
      )}
      {object.type === "text" && (
        <Text object={object as AbstractSyntaxTree<TextAttributes>} />
      )}
    </>
  );
};
