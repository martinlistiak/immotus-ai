import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
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
        tempScene.add(gltf.scene.clone()); // Clone to prevent modifications to original

        // Reference to store all meshes to check for shared geometries
        const processedGeometries = new Map();

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

          // Get the local-to-world transformation matrix
          mesh.updateWorldMatrix(true, false);
          const matrix = mesh.matrixWorld.clone();

          // Extract position from matrix
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          const scale = new THREE.Vector3();
          matrix.decompose(position, quaternion, scale);

          // Convert quaternion to Euler angles
          const rotation = new THREE.Euler().setFromQuaternion(quaternion);

          // Create position, rotation and scale objects
          const positionObj = {
            x: position.x,
            y: position.y,
            z: position.z,
          };

          const rotationObj = {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
          };

          const scaleObj = {
            x: scale.x,
            y: scale.y,
            z: scale.z,
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
            position: positionObj,
            rotation: rotationObj,
            scale: scaleObj,
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
            // Check if we've already processed this geometry
            const geometryId = mesh.geometry.uuid;
            let geometryArray: number[];

            if (processedGeometries.has(geometryId)) {
              // Reuse the processed geometry
              geometryArray = processedGeometries.get(geometryId);
              console.log(
                `Reusing processed geometry for ${mesh.name || "unnamed mesh"}`
              );
            } else {
              // Process new geometry
              // Ensure the geometry has a well-defined triangulation
              const mergedGeometry = new THREE.BufferGeometry();

              // Clone the original geometry to avoid modifying it
              const originalGeometry = mesh.geometry.clone();

              // Make sure the geometry is properly indexed (important for correct triangulation)
              if (!originalGeometry.index) {
                originalGeometry.computeVertexNormals();
                // If not indexed, create an indexed version
                const indexedBufferGeom =
                  BufferGeometryUtils.mergeVertices(originalGeometry);
                originalGeometry.index = indexedBufferGeom.index;
                originalGeometry.attributes = indexedBufferGeom.attributes;
              }

              // Apply world matrix to put geometry in world space
              const cloneForPositions = originalGeometry.clone();

              // Get position attribute
              const positionAttribute =
                cloneForPositions.getAttribute("position");

              if (positionAttribute) {
                // Create new position buffer with corrected order
                const positions = new Float32Array(
                  positionAttribute.array.length
                );
                const indexAttribute = cloneForPositions.index;

                if (indexAttribute) {
                  // Get indexed positions for proper triangulation
                  const indices = indexAttribute.array;

                  // Set vertex positions in the correct order using the index buffer
                  for (let i = 0; i < indices.length; i++) {
                    const index = indices[i];
                    const vertexIndex = i * 3;
                    const sourceIndex = index * 3;

                    positions[vertexIndex] =
                      positionAttribute.array[sourceIndex];
                    positions[vertexIndex + 1] =
                      positionAttribute.array[sourceIndex + 1];
                    positions[vertexIndex + 2] =
                      positionAttribute.array[sourceIndex + 2];
                  }

                  // Create new non-indexed buffer geometry
                  mergedGeometry.setAttribute(
                    "position",
                    new THREE.BufferAttribute(positions, 3)
                  );
                } else {
                  // If no index, just copy the positions
                  mergedGeometry.setAttribute(
                    "position",
                    positionAttribute.clone()
                  );
                }

                // Compute normals
                mergedGeometry.computeVertexNormals();

                // Get the final position attribute
                const finalPositions = mergedGeometry.getAttribute("position");
                geometryArray = Array.from(finalPositions.array);

                // Store for reuse
                processedGeometries.set(geometryId, geometryArray);

                console.log(
                  `Processed geometry for ${mesh.name || "unnamed mesh"} with ${
                    geometryArray.length / 3
                  } vertices`
                );
              } else {
                console.warn(
                  `No position attribute found for mesh ${
                    mesh.name || "unnamed"
                  }`
                );
                geometryArray = [];
              }
            }

            // Set the final attributes
            if (geometryArray.length > 0) {
              finalAttributes = {
                ...baseAttributes,
                geometry: geometryArray,
              } as MeshAttributes;
            } else {
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
        tempScene.remove(tempScene.children[0]);

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
