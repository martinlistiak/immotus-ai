import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { v4 as uuid } from "uuid";
import type {
  SceneObjects,
  AbstractSyntaxTree,
  ObjectAttributes,
  ObjectType,
} from "../types/scene-ast";

export const importGltf = async (gltfUrl: string): Promise<SceneObjects> => {
  // Create a new loader
  const loader = new GLTFLoader();

  // Load the GLTF file
  return new Promise((resolve, reject) => {
    loader.load(
      gltfUrl,
      (gltf) => {
        const sceneObjects: SceneObjects = [];

        // Process all objects in the GLTF scene
        gltf.scene.traverse((object) => {
          // Skip non-mesh objects for now
          if (!(object instanceof THREE.Mesh)) return;

          const mesh = object as THREE.Mesh;
          let objectType: ObjectType = "mesh";
          let attributes: ObjectAttributes;

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

          // Extract position, rotation and scale
          const position = {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
          };

          const rotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z,
          };

          const scale = {
            x: mesh.scale.x,
            y: mesh.scale.y,
            z: mesh.scale.z,
          };

          // Extract material properties
          let color = "#ffffff";
          let roughness = 0.5;
          let metalness = 0.2;

          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
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
          const baseAttributes = {
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

          // Create the scene object based on type
          const sceneObject: AbstractSyntaxTree<ObjectAttributes> = {
            id: uuid(),
            type: objectType,
            parentId:
              mesh.parent === gltf.scene ? null : mesh.parent?.uuid || null,
            attributes: baseAttributes as ObjectAttributes,
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

            const lightObject: AbstractSyntaxTree<ObjectAttributes> = {
              id: uuid(),
              type: "light",
              parentId:
                light.parent === gltf.scene ? null : light.parent?.uuid || null,
              attributes: {
                name: light.name || "Imported Light",
                description: "",
                position: {
                  x: light.position.x,
                  y: light.position.y,
                  z: light.position.z,
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

        resolve(sceneObjects);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF:", error);
        reject(error);
      }
    );
  });
};
