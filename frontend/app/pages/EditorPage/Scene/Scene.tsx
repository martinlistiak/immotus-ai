import { v4 as uuid } from "uuid";
import {
  Environment,
  Grid,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Color,
  Vector3,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
} from "three";

import { useSceneContext } from "./Scene.context";
import { Box } from "./objects/Box";
import { Light } from "./objects/Light";
import {
  type AbstractSyntaxTree,
  type BoxAttributes,
  type LightAttributes,
  type MeshAttributes,
  type SphereAttributes,
  type PlaneAttributes,
  type CylinderAttributes,
  type ConeAttributes,
  type TorusAttributes,
  type CircleAttributes,
  type RingAttributes,
  type DodecahedronAttributes,
  type IcosahedronAttributes,
  type OctahedronAttributes,
  type TetrahedronAttributes,
  type TorusKnotAttributes,
  type TextAttributes,
  type SceneType,
  type ObjectType,
  CameraType,
} from "app/types/scene-ast";
import { MeshComponent } from "./objects/Mesh";
import { Sphere } from "./objects/Sphere";
import { GroupComponent } from "./objects/Group";
import { Plane } from "./objects/Plane";
import { Cylinder } from "./objects/Cylinder";
import { Cone } from "./objects/Cone";
import { Torus } from "./objects/Torus";
import { Circle } from "./objects/Circle";
import { Ring } from "./objects/Ring";
import { Dodecahedron } from "./objects/Dodecahedron";
import { Icosahedron } from "./objects/Icosahedron";
import { Octahedron } from "./objects/Octahedron";
import { Tetrahedron } from "./objects/Tetrahedron";
import { TorusKnot } from "./objects/TorusKnot";
import { Text } from "./objects/Text";
import { PrimitivePlacer } from "./objects/PrimitivePlacer";
import { BoxHelper } from "./helpers/BoxHelper";
import { TechnicalDrawingView } from "./helpers/TechnicalDrawingsView";

const SceneEnvironment = () => {
  return <Environment preset="studio" background blur={1} />;
};

// A specialized component for technical drawing mode

export function Scene({ ...props }) {
  const {
    scene,
    setSelectedObjects,
    activeTool,
    setActiveTool,
    activeCamera,
    dispatchScene,
    hiddenObjectIds,
  } = useSceneContext();
  const [ghostPosition, setGhostPosition] = useState<Vector3 | null>(null);

  const handlePlacePrimitive = (position: Vector3) => {
    // Create a new primitive based on active tool
    let newObject: Partial<SceneType["objects"][number]> = {
      id: uuid(), // Generate unique ID
      type: activeTool as ObjectType,
      parentId: null,
      attributes: {
        name: activeTool.charAt(0).toUpperCase() + activeTool.slice(1),
        description: `A ${activeTool}`,
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
        rotation: {
          x: activeTool === "plane" ? -Math.PI / 2 : 0,
          y: 0,
          z: 0,
        },
        material: {
          color: "#ff9900",
          roughness: 0.7,
          metalness: 0.2,
        },
      },
    };

    // Add type-specific attributes
    switch (activeTool) {
      case "box":
        break;
      case "sphere":
        (newObject.attributes as SphereAttributes).radius = 0.5;
        (newObject.attributes as SphereAttributes).widthSegments = 32;
        (newObject.attributes as SphereAttributes).heightSegments = 16;
        break;
      case "plane":
        (newObject.attributes as PlaneAttributes).width = 1;
        (newObject.attributes as PlaneAttributes).height = 1;
        (newObject.attributes as PlaneAttributes).widthSegments = 1;
        (newObject.attributes as PlaneAttributes).heightSegments = 1;
        break;
      case "cylinder":
        (newObject.attributes as CylinderAttributes).radiusTop = 0.5;
        (newObject.attributes as CylinderAttributes).radiusBottom = 0.5;
        (newObject.attributes as CylinderAttributes).height = 1;
        (newObject.attributes as CylinderAttributes).radialSegments = 32;
        (newObject.attributes as CylinderAttributes).heightSegments = 1;
        break;
      case "cone":
        (newObject.attributes as ConeAttributes).radius = 0.5;
        (newObject.attributes as ConeAttributes).height = 1;
        (newObject.attributes as ConeAttributes).radialSegments = 32;
        (newObject.attributes as ConeAttributes).heightSegments = 1;
        break;
      case "torus":
        (newObject.attributes as TorusAttributes).radius = 0.5;
        (newObject.attributes as TorusAttributes).tube = 0.2;
        (newObject.attributes as TorusAttributes).radialSegments = 16;
        (newObject.attributes as TorusAttributes).tubularSegments = 32;
        break;
      case "circle":
        (newObject.attributes as CircleAttributes).radius = 0.5;
        (newObject.attributes as CircleAttributes).segments = 32;
        break;
      case "ring":
        (newObject.attributes as RingAttributes).innerRadius = 0.3;
        (newObject.attributes as RingAttributes).outerRadius = 0.5;
        (newObject.attributes as RingAttributes).thetaSegments = 32;
        break;
      case "dodecahedron":
      case "icosahedron":
      case "octahedron":
      case "tetrahedron":
        (newObject.attributes as DodecahedronAttributes).radius = 0.5;
        break;
      case "torusknot":
        (newObject.attributes as TorusKnotAttributes).radius = 0.5;
        (newObject.attributes as TorusKnotAttributes).tube = 0.2;
        (newObject.attributes as TorusKnotAttributes).tubularSegments = 64;
        (newObject.attributes as TorusKnotAttributes).radialSegments = 8;
        (newObject.attributes as TorusKnotAttributes).p = 2;
        (newObject.attributes as TorusKnotAttributes).q = 3;
        break;
      case "light":
        delete (newObject.attributes as any).material;
        (newObject.attributes as LightAttributes).intensity = 1;
        (newObject.attributes as LightAttributes).color = "#ffffff";
        (newObject.attributes as LightAttributes).distance = 1000;
        (newObject.attributes as LightAttributes).decay = 0.2;
        break;
      case "text":
        (newObject.attributes as TextAttributes).text = "Text";
        (newObject.attributes as TextAttributes).size = 0.5;
        (newObject.attributes as TextAttributes).height = 0.1;
        break;
    }

    dispatchScene({
      type: "ADD_OBJECT",
      payload: { object: newObject as SceneType["objects"][number] },
    });

    setActiveTool("move");

    if (newObject.id) {
      setSelectedObjects([newObject.id]);
    }
  };

  const isActiveTool =
    activeTool === "box" ||
    activeTool === "sphere" ||
    activeTool === "plane" ||
    activeTool === "cylinder" ||
    activeTool === "cone" ||
    activeTool === "torus" ||
    activeTool === "circle" ||
    activeTool === "ring" ||
    activeTool === "dodecahedron" ||
    activeTool === "icosahedron" ||
    activeTool === "octahedron" ||
    activeTool === "tetrahedron" ||
    activeTool === "torusknot" ||
    activeTool === "text" ||
    activeTool === "light";

  // Component to handle primitive placement interaction
  return (
    <div
      id="scene"
      className="w-[100vw] h-[100vh]"
      onPointerDown={(event) => {
        if (isActiveTool && ghostPosition) {
          // Place the primitive at the ghost position
          handlePlacePrimitive(ghostPosition);
          event.stopPropagation();
        } else if (activeTool === "move" || activeTool === "select") {
          setSelectedObjects([]);
        }
      }}
    >
      <Canvas
        className="w-full h-full"
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        }}
        camera={{ position: [0, 4, 10], fov: 25, near: 0.3, far: 1000 }}
        shadows
      >
        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={200}
          enableDamping={true}
          dampingFactor={0.05}
          zoomSpeed={0.2}
          enabled={activeTool !== "box" && activeTool !== "light"} // Disable orbit controls when placing a box
        />

        {/* Background color - white for technical drawing mode in 2D, dark gray for 3D */}
        <color
          attach="background"
          args={[activeCamera === CameraType.TWO_D ? "#ffffff" : "#2D2E32"]}
        />

        {/* Only show grid in 3D mode */}
        {activeCamera === CameraType.THREE_D && (
          <Grid
            position={[0, 0, 0]}
            args={[1000, 1000]}
            cellSize={1}
            sectionColor={new Color(0x555555)}
            receiveShadow
          />
        )}

        {activeCamera === CameraType.TWO_D && (
          <>
            <OrthographicCamera
              makeDefault
              position={[0, 10, 0]} // Top-down for plan
              zoom={50} // Adjust zoom to match drawing scale
              near={0.1}
              far={1000}
            >
              <primitive object={new Vector3(0, 0, 0)} />
            </OrthographicCamera>
            <TechnicalDrawingView />
          </>
        )}

        {/* Primitive placement helper */}
        {isActiveTool && (
          <PrimitivePlacer
            setGhostPosition={setGhostPosition}
            ghostPosition={ghostPosition}
            primitive={activeTool}
          />
        )}

        {/* Only show ambient light in 3D mode */}
        {activeCamera === CameraType.THREE_D && (
          <ambientLight intensity={0.25} />
        )}

        <group {...props} dispose={null}>
          <scene name={scene?.name}>
            {scene?.objects
              .filter((obj) => obj.parentId === null)
              .filter((obj) => !hiddenObjectIds.includes(obj.id))
              .map((object) => (
                <Fragment key={object.id}>
                  {object.type === "box" && (
                    <Box object={object as AbstractSyntaxTree<BoxAttributes>} />
                  )}
                  {object.type === "sphere" && (
                    <Sphere
                      object={object as AbstractSyntaxTree<SphereAttributes>}
                    />
                  )}
                  {object.type === "light" && (
                    <Light
                      object={object as AbstractSyntaxTree<LightAttributes>}
                    />
                  )}
                  {object.type === "mesh" && (
                    <MeshComponent
                      object={object as AbstractSyntaxTree<MeshAttributes>}
                    />
                  )}
                  {object.type === "group" && (
                    <GroupComponent object={object} />
                  )}
                  {object.type === "plane" && (
                    <Plane
                      object={object as AbstractSyntaxTree<PlaneAttributes>}
                    />
                  )}
                  {object.type === "cylinder" && (
                    <Cylinder
                      object={object as AbstractSyntaxTree<CylinderAttributes>}
                    />
                  )}
                  {object.type === "cone" && (
                    <Cone
                      object={object as AbstractSyntaxTree<ConeAttributes>}
                    />
                  )}
                  {object.type === "torus" && (
                    <Torus
                      object={object as AbstractSyntaxTree<TorusAttributes>}
                    />
                  )}
                  {object.type === "circle" && (
                    <Circle
                      object={object as AbstractSyntaxTree<CircleAttributes>}
                    />
                  )}
                  {object.type === "ring" && (
                    <Ring
                      object={object as AbstractSyntaxTree<RingAttributes>}
                    />
                  )}
                  {object.type === "dodecahedron" && (
                    <Dodecahedron
                      object={
                        object as AbstractSyntaxTree<DodecahedronAttributes>
                      }
                    />
                  )}
                  {object.type === "icosahedron" && (
                    <Icosahedron
                      object={
                        object as AbstractSyntaxTree<IcosahedronAttributes>
                      }
                    />
                  )}
                  {object.type === "octahedron" && (
                    <Octahedron
                      object={
                        object as AbstractSyntaxTree<OctahedronAttributes>
                      }
                    />
                  )}
                  {object.type === "tetrahedron" && (
                    <Tetrahedron
                      object={
                        object as AbstractSyntaxTree<TetrahedronAttributes>
                      }
                    />
                  )}
                  {object.type === "torusknot" && (
                    <TorusKnot
                      object={object as AbstractSyntaxTree<TorusKnotAttributes>}
                    />
                  )}
                  {object.type === "text" && (
                    <Text
                      object={object as AbstractSyntaxTree<TextAttributes>}
                    />
                  )}
                </Fragment>
              ))}

            {/* Only show directional light in 3D mode */}
            {activeCamera === CameraType.THREE_D && (
              <directionalLight position={[200, 200, 300]} intensity={0.2} />
            )}
            <BoxHelper />
          </scene>
        </group>
      </Canvas>
    </div>
  );
}
