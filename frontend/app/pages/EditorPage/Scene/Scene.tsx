import { v4 as uuid } from "uuid";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Fragment, useState } from "react";
import { Color, Vector3 } from "three";
import { useSceneContext } from "./Scene.context";
import { Box, BoxPlacer } from "./objects/Box";
import { Light, LightPlacer } from "./objects/Light";
import type {
  AbstractSyntaxTree,
  BoxAttributes,
  LightAttributes,
  MeshAttributes,
  SphereAttributes,
} from "app/types/scene-ast";
import { MeshComponent } from "./objects/Mesh";
import { Sphere } from "./objects/Sphere";

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
  const [ghostBoxPosition, setGhostBoxPosition] = useState<Vector3 | null>(
    null
  );

  const handlePlaceBox = (position: Vector3) => {
    const newBox = {
      id: uuid(), // Generate unique ID
      type: "box" as const,
      parentId: null,
      attributes: {
        name: "Box",
        description: "A box",
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
      },
    };

    dispatchScene({ type: "ADD_OBJECT", payload: { object: newBox } });

    setActiveTool("move");

    setSelectedObjects([newBox.id]);
  };

  const handlePlaceLight = (position: Vector3) => {
    const newLight = {
      id: uuid(),
      type: "light" as const,
      parentId: null,
      attributes: {
        name: "Light",
        description: "A light",
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
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
    };

    dispatchScene({ type: "ADD_OBJECT", payload: { object: newLight } });

    setActiveTool("move");

    setSelectedObjects([newLight.id]);
  };

  // Component to handle box placement interaction
  return (
    <div
      id="scene"
      className="w-[100vw] h-[100vh]"
      onPointerDown={(event) => {
        if (activeTool === "box" && ghostBoxPosition) {
          // Place the box at the ghost position
          handlePlaceBox(ghostBoxPosition);
          event.stopPropagation();
        } else if (activeTool === "light" && ghostBoxPosition) {
          // Place the light at the ghost position
          handlePlaceLight(ghostBoxPosition);
          event.stopPropagation();
        } else if (activeTool !== "box" && activeTool !== "light") {
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
        {/* Box placement helper */}
        {activeTool === "box" && (
          <BoxPlacer
            setGhostBoxPosition={setGhostBoxPosition}
            ghostBoxPosition={ghostBoxPosition}
          />
        )}
        {activeTool === "light" && (
          <LightPlacer
            setGhostBoxPosition={setGhostBoxPosition}
            ghostBoxPosition={ghostBoxPosition}
          />
        )}
        <ambientLight intensity={0.25} />
        <group {...props} dispose={null}>
          <scene name={scene?.name}>
            {scene?.objects.map((object) => (
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
              </Fragment>
            ))}

            <directionalLight position={[200, 200, 300]} intensity={0.2} />
          </scene>
        </group>
      </Canvas>
    </div>
  );
}
