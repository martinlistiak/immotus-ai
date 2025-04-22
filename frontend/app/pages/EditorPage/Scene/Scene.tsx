import { v4 as uuid } from "uuid";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Fragment, useState } from "react";
import { Color, Vector3 } from "three";
import { useSceneContext } from "./Scene.context";
import { Box } from "./objects/Box";
import { Light } from "./objects/Light";
import type {
  AbstractSyntaxTree,
  BoxAttributes,
  LightAttributes,
  MeshAttributes,
  SphereAttributes,
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
  SceneType,
  ObjectType,
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

const SceneEnvironment = () => {
  return <Environment preset="studio" background blur={1} />;
};

export function Scene({ ...props }) {
  const {
    scene,
    setSelectedObjects,
    activeTool,
    setActiveTool,
    dispatchScene,
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
          x: 0,
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

  // Component to handle primitive placement interaction
  return (
    <div
      id="scene"
      className="w-[100vw] h-[100vh]"
      onPointerDown={(event) => {
        if (
          (activeTool === "box" ||
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
            activeTool === "light") &&
          ghostPosition
        ) {
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
          antialias: false,
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
        <color attach="background" args={["#2D2E32"]} />

        <Grid
          position={[0, 0, 0]}
          args={[1000, 1000]}
          cellSize={1}
          sectionColor={new Color(0x555555)}
          receiveShadow
        />
        {/* Primitive placement helper */}
        {(activeTool === "box" ||
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
          activeTool === "light") && (
          <PrimitivePlacer
            setGhostPosition={setGhostPosition}
            ghostPosition={ghostPosition}
            primitive={activeTool}
          />
        )}
        <ambientLight intensity={0.25} />
        <group {...props} dispose={null}>
          <scene name={scene?.name}>
            {scene?.objects
              .filter((obj) => obj.parentId === null)
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

            <directionalLight position={[200, 200, 300]} intensity={0.2} />
            {/* {(hoveredObject ||
            
              selectedObjects.some(
                (object) => object.id === props.object.id
              )) && (
                <primitive
                  object={new BoxHelper(meshRef.current!, "#ffffff")}
                  ref={boxHelperRef}
                >
                  <lineBasicMaterial
                    transparent
                    depthTest={false}
                    color="rgb(37, 137, 255)"
                    linewidth={40}
                  />
                </primitive>
              )} */}
          </scene>
        </group>
      </Canvas>
    </div>
  );
}
