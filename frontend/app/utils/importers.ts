import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { v4 as uuid } from "uuid";
import type {
  SceneObjects,
  AbstractSyntaxTree,
  ObjectAttributes,
  ObjectType,
  MeshAttributes,
  BaseObjectWithMaterialAttributes,
} from "../types/scene-ast";

export const importGltf = async (gltfUrl: string): Promise<SceneObjects> => {
  // Create a new loader
  const loader = new GLTFLoader();

  // Load the GLTF file
  return new Promise((resolve, reject) => {
    loader.load(
      gltfUrl,
      (gltf) => {
        console.log("Loaded GLTF:", gltf);
        const sceneObjects: SceneObjects = [];

        // Create a temporary scene to process the geometries
        const tempScene = new THREE.Scene();
        tempScene.add(gltf.scene);

        // Process all objects in the GLTF scene
        gltf.scene.traverse((object) => {
          // Skip non-mesh objects for now
          if (!(object instanceof THREE.Mesh)) return;

          const mesh = object as THREE.Mesh;
          let objectType: ObjectType = "mesh";

          // Try to determine the primitive type based on geometry
          if (mesh.geometry instanceof THREE.BoxGeometry) {
            objectType = "box";
          } else if (mesh.geometry instanceof THREE.SphereGeometry) {
            objectType = "sphere";
          } else if (mesh.geometry instanceof THREE.PlaneGeometry) {
            objectType = "plane";
          } else if (mesh.geometry instanceof THREE.CylinderGeometry) {
            objectType = "cylinder";
          } else if (mesh.geometry instanceof THREE.ConeGeometry) {
            objectType = "cone";
          } else if (mesh.geometry instanceof THREE.TorusGeometry) {
            objectType = "torus";
          } else if (mesh.geometry instanceof THREE.CircleGeometry) {
            objectType = "circle";
          } else if (mesh.geometry instanceof THREE.RingGeometry) {
            objectType = "ring";
          } else if (mesh.geometry instanceof THREE.DodecahedronGeometry) {
            objectType = "dodecahedron";
          } else if (mesh.geometry instanceof THREE.IcosahedronGeometry) {
            objectType = "icosahedron";
          } else if (mesh.geometry instanceof THREE.OctahedronGeometry) {
            objectType = "octahedron";
          } else if (mesh.geometry instanceof THREE.TetrahedronGeometry) {
            objectType = "tetrahedron";
          } else if (mesh.geometry instanceof THREE.TorusKnotGeometry) {
            objectType = "torusknot";
          }

          // Get the world position/rotation/scale
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();
          mesh.updateWorldMatrix(true, false);
          mesh.matrixWorld.decompose(
            worldPosition,
            worldQuaternion,
            worldScale
          );

          // Convert quaternion to Euler angles
          const worldRotation = new THREE.Euler().setFromQuaternion(
            worldQuaternion
          );

          // Extract position, rotation and scale
          const position = {
            x: worldPosition.x,
            y: worldPosition.y,
            z: worldPosition.z,
          };

          const rotation = {
            x: worldRotation.x,
            y: worldRotation.y,
            z: worldRotation.z,
          };

          const scale = {
            x: worldScale.x,
            y: worldScale.y,
            z: worldScale.z,
          };

          // Extract material properties
          let color = "#ffffff";
          let roughness = 0.5;
          let metalness = 0.2;

          if (mesh.material) {
            // Handle both single materials and material arrays
            const material = Array.isArray(mesh.material)
              ? (mesh.material[0] as THREE.MeshStandardMaterial)
              : (mesh.material as THREE.MeshStandardMaterial);

            if (material.color) {
              color = "#" + material.color.getHexString();
            }
            if (material.roughness !== undefined) {
              roughness = material.roughness;
            }
            if (material.metalness !== undefined) {
              metalness = material.metalness;
            }
          }

          // Create base attributes
          const baseAttributes: BaseObjectWithMaterialAttributes = {
            name: mesh.name || `Imported ${objectType}`,
            description: "",
            position,
            rotation,
            scale,
            material: {
              color,
              roughness,
              metalness,
            },
          };

          let finalAttributes: ObjectAttributes;

          // For mesh type, extract the geometry data
          if (
            objectType === "mesh" &&
            mesh.geometry instanceof THREE.BufferGeometry
          ) {
            // Clone the geometry to avoid modifying the original
            const clonedGeometry = mesh.geometry.clone();

            // Apply the mesh's matrix transform to the geometry
            const transformMatrix = new THREE.Matrix4();
            // Reset position/rotation/scale for the geometry since we'll apply them separately
            transformMatrix.makeScale(1, 1, 1); // Identity scale
            clonedGeometry.applyMatrix4(transformMatrix);

            // Ensure normals are computed
            clonedGeometry.computeVertexNormals();
            clonedGeometry.normalizeNormals();

            const positionAttribute = clonedGeometry.getAttribute("position");

            if (positionAttribute) {
              // Create array from position attribute
              const geometryArray = Array.from(positionAttribute.array);

              finalAttributes = {
                ...baseAttributes,
                geometry: geometryArray,
              } as MeshAttributes;

              console.log(
                `Extracted geometry for ${mesh.name || "unnamed mesh"} with ${
                  geometryArray.length / 3
                } vertices`
              );
            } else {
              console.warn(
                `No position attribute found for mesh ${mesh.name || "unnamed"}`
              );
              finalAttributes = baseAttributes as ObjectAttributes;
            }
          } else {
            finalAttributes = baseAttributes as ObjectAttributes;
          }

          // Create the scene object based on type
          const sceneObject: AbstractSyntaxTree<ObjectAttributes> = {
            id: uuid(),
            type: objectType,
            parentId:
              mesh.parent === gltf.scene ? null : mesh.parent?.uuid || null,
            attributes: finalAttributes,
          };

          sceneObjects.push(sceneObject);
        });

        // Process lights
        gltf.scene.traverse((object) => {
          if (
            object instanceof THREE.PointLight ||
            object instanceof THREE.DirectionalLight ||
            object instanceof THREE.SpotLight
          ) {
            const light = object as THREE.Light;

            // Get world position for the light
            const worldPosition = new THREE.Vector3();
            light.updateMatrixWorld(true);
            light.getWorldPosition(worldPosition);

            const lightObject: AbstractSyntaxTree<ObjectAttributes> = {
              id: uuid(),
              type: "light",
              parentId:
                light.parent === gltf.scene ? null : light.parent?.uuid || null,
              attributes: {
                name: light.name || "Imported Light",
                description: "",
                position: {
                  x: worldPosition.x,
                  y: worldPosition.y,
                  z: worldPosition.z,
                },
                rotation: {
                  x: light.rotation.x,
                  y: light.rotation.y,
                  z: light.rotation.z,
                },
                scale: {
                  x: 1,
                  y: 1,
                  z: 1,
                },
                intensity: light.intensity,
                color:
                  "#" + (light.color ? light.color.getHexString() : "ffffff"),
                distance:
                  light instanceof THREE.PointLight ? light.distance : 1000,
                decay: light instanceof THREE.PointLight ? light.decay : 0.2,
              } as ObjectAttributes,
            };

            sceneObjects.push(lightObject);
          }
        });

        // Clean up
        tempScene.remove(gltf.scene);

        console.log(`Imported ${sceneObjects.length} objects from GLTF`);
        resolve(sceneObjects);
      },
      (progressEvent) => {
        console.log("Loading progress:", progressEvent);
      },
      (error) => {
        console.error("Error loading GLTF:", error);
        reject(error);
      }
    );
  });
};
