import { BasicObjectAttributes } from "./attributes/BasicObjectAttributes";
import { useSceneContext } from "../../Scene/Scene.context";

import { LightAttributes } from "./attributes/LightAttributes";
import { MaterialAttributes } from "./attributes/MaterialAttributes";
import { PlaneAttributes } from "./attributes/PlaneAttributes";
import { SphereAttributes } from "./attributes/SphereAttributes";
import { CylinderAttributes } from "./attributes/CylinderAttributes";
import { ConeAttributes } from "./attributes/ConeAttributes";
import { TorusAttributes } from "./attributes/TorusAttributes";
import { CircleAttributes } from "./attributes/CircleAttributes";

export const AttributeInspector = () => {
  const { selectedObjects } = useSceneContext();

  if (selectedObjects.length !== 1) return null;

  const selectedObject = selectedObjects[0];

  return (
    <>
      <BasicObjectAttributes />
      {selectedObject.type === "light" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <LightAttributes />
        </>
      )}
      {!selectedObject.type.includes("light") && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <MaterialAttributes />
        </>
      )}
      {selectedObject.type === "plane" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <PlaneAttributes />
        </>
      )}
      {selectedObject.type === "sphere" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <SphereAttributes />
        </>
      )}
      {selectedObject.type === "cylinder" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <CylinderAttributes />
        </>
      )}
      {selectedObject.type === "cone" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <ConeAttributes />
        </>
      )}
      {selectedObject.type === "torus" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <TorusAttributes />
        </>
      )}
      {selectedObject.type === "circle" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <CircleAttributes />
        </>
      )}
      {/* Add other attribute editors as needed */}
      {/* 
      {selectedObject.type === "ring" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <RingAttributes />
        </>
      )}
      {selectedObject.type === "dodecahedron" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <DodecahedronAttributes />
        </>
      )}
      {selectedObject.type === "icosahedron" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <IcosahedronAttributes />
        </>
      )}
      {selectedObject.type === "octahedron" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <OctahedronAttributes />
        </>
      )}
      {selectedObject.type === "tetrahedron" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <TetrahedronAttributes />
        </>
      )}
      {selectedObject.type === "torusknot" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <TorusKnotAttributes />
        </>
      )}
      {selectedObject.type === "text" && (
        <>
          <div className="h-[1px] mt-4 mb-3 bg-gray-800" />
          <TextAttributes />
        </>
      )}
      */}
    </>
  );
};
