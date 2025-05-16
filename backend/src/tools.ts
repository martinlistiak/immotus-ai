import { ToolUnion } from '@anthropic-ai/sdk/resources';

export const tools = [
  {
    name: 'SET_SCENE',
    description:
      'This tool replaces everything that is in current scene with new objects. This can be used to perform many actions at once in an existing scene or when generating a new scene from scratch. You MUST provide a complete scene object with all required fields (id, name, description, createdAt, updatedAt, objects array). Each object in the objects array must have all required fields based on its type (id, type, attributes, parentId). Never call this tool with empty input or partial data.',
    input_schema: {
      type: 'object',
      properties: {
        scene: {
          type: 'object',
          description: 'Clears the scene and sets the new scene',
          properties: {
            objects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: [
                      'box',
                      'light',
                      'mesh',
                      'sphere',
                      'plane',
                      'cylinder',
                      'cone',
                      'torus',
                      'circle',
                      'ring',
                      'dodecahedron',
                      'icosahedron',
                      'octahedron',
                      'tetrahedron',
                      'torusknot',
                      'text',
                      'group',
                    ],
                  },
                  parentId: { type: ['string', 'null'] },
                  attributes: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      position: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' },
                          z: { type: 'number' },
                        },
                        required: ['x', 'y', 'z'],
                      },
                      rotation: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' },
                          z: { type: 'number' },
                        },
                        required: ['x', 'y', 'z'],
                      },
                      scale: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' },
                          z: { type: 'number' },
                        },
                        required: ['x', 'y', 'z'],
                      },
                      intensity: { type: 'number' },
                      color: { type: 'string' },
                      distance: { type: 'number' },
                      decay: { type: 'number' },
                      geometry: { type: 'array', items: { type: 'number' } },
                      material: {
                        type: 'object',
                        properties: {
                          color: { type: 'string' },
                          roughness: { type: 'number' },
                          metalness: { type: 'number' },
                        },
                        required: ['color', 'roughness', 'metalness'],
                      },
                      radius: { type: 'number' },
                      width: { type: 'number' },
                      height: { type: 'number' },
                      widthSegments: { type: 'number' },
                      heightSegments: { type: 'number' },
                      phiStart: { type: 'number' },
                      phiLength: { type: 'number' },
                      thetaStart: { type: 'number' },
                      thetaLength: { type: 'number' },
                      radiusTop: { type: 'number' },
                      radiusBottom: { type: 'number' },
                      radialSegments: { type: 'number' },
                      openEnded: { type: 'boolean' },
                      tube: { type: 'number' },
                      tubularSegments: { type: 'number' },
                      arc: { type: 'number' },
                      segments: { type: 'number' },
                      innerRadius: { type: 'number' },
                      outerRadius: { type: 'number' },
                      thetaSegments: { type: 'number' },
                      phiSegments: { type: 'number' },
                      detail: { type: 'number' },
                      p: { type: 'number' },
                      q: { type: 'number' },
                      text: { type: 'string' },
                      size: { type: 'number' },
                      curveSegments: { type: 'number' },
                      bevelEnabled: { type: 'boolean' },
                      bevelThickness: { type: 'number' },
                      bevelSize: { type: 'number' },
                      bevelSegments: { type: 'number' },
                    },
                  },
                },
                required: ['id', 'type', 'attributes', 'parentId'],
                oneOf: [
                  {
                    properties: {
                      type: { const: 'mesh' },
                      attributes: {
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'geometry',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'light' },
                      attributes: {
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'color',
                          'distance',
                          'decay',
                          'intensity',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'box' },
                      attributes: {
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'sphere' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          widthSegments: { type: 'number' },
                          heightSegments: { type: 'number' },
                          phiStart: { type: 'number' },
                          phiLength: { type: 'number' },
                          thetaStart: { type: 'number' },
                          thetaLength: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'plane' },
                      attributes: {
                        properties: {
                          width: { type: 'number' },
                          height: { type: 'number' },
                          widthSegments: { type: 'number' },
                          heightSegments: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'width',
                          'height',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'cylinder' },
                      attributes: {
                        properties: {
                          radiusTop: { type: 'number' },
                          radiusBottom: { type: 'number' },
                          height: { type: 'number' },
                          radialSegments: { type: 'number' },
                          heightSegments: { type: 'number' },
                          openEnded: { type: 'boolean' },
                          thetaStart: { type: 'number' },
                          thetaLength: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radiusTop',
                          'radiusBottom',
                          'height',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'cone' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          height: { type: 'number' },
                          radialSegments: { type: 'number' },
                          heightSegments: { type: 'number' },
                          openEnded: { type: 'boolean' },
                          thetaStart: { type: 'number' },
                          thetaLength: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                          'height',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'torus' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          tube: { type: 'number' },
                          radialSegments: { type: 'number' },
                          tubularSegments: { type: 'number' },
                          arc: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                          'tube',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'circle' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          segments: { type: 'number' },
                          thetaStart: { type: 'number' },
                          thetaLength: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'ring' },
                      attributes: {
                        properties: {
                          innerRadius: { type: 'number' },
                          outerRadius: { type: 'number' },
                          thetaSegments: { type: 'number' },
                          phiSegments: { type: 'number' },
                          thetaStart: { type: 'number' },
                          thetaLength: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'innerRadius',
                          'outerRadius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'dodecahedron' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          detail: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'icosahedron' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          detail: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'octahedron' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          detail: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'tetrahedron' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          detail: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'torusknot' },
                      attributes: {
                        properties: {
                          radius: { type: 'number' },
                          tube: { type: 'number' },
                          tubularSegments: { type: 'number' },
                          radialSegments: { type: 'number' },
                          p: { type: 'number' },
                          q: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'radius',
                          'tube',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'text' },
                      attributes: {
                        properties: {
                          text: { type: 'string' },
                          size: { type: 'number' },
                          height: { type: 'number' },
                          curveSegments: { type: 'number' },
                          bevelEnabled: { type: 'boolean' },
                          bevelThickness: { type: 'number' },
                          bevelSize: { type: 'number' },
                          bevelSegments: { type: 'number' },
                        },
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                          'material',
                          'text',
                        ],
                      },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'group' },
                      attributes: {
                        required: [
                          'name',
                          'description',
                          'position',
                          'rotation',
                          'scale',
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          required: ['objects'],
        },
      },
      required: ['scene'],
    },
  },
  {
    name: 'GET_SCENE',
    description:
      "Gets all information about the current scene. In order to save on token usage, use this tool only when necessary most importantly when performing actions in an existing scene. You should call this tool before modifying an existing scene to get the current state, especially when you need to reference object IDs or understand the scene structure. Never call this tool with any input parameters as it doesn't require any.",
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  // TODO: Add more tools from reducer actions
  {
    name: 'ADD_OBJECT',
    description:
      'Adds an object to the scene. Use this tool when you want to add a single or a few objects in sequence to the scene. You MUST provide a complete object with all required fields (id, type, attributes, parentId). The required attributes depend on the object type - refer to the schema for details. Never call this tool with empty or incomplete object data.',
    input_schema: {
      type: 'object',
      properties: {
        object: {
          type: 'object',
          description: 'The object to add to the scene',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: [
                'box',
                'light',
                'mesh',
                'sphere',
                'plane',
                'cylinder',
                'cone',
                'torus',
                'circle',
                'ring',
                'dodecahedron',
                'icosahedron',
                'octahedron',
                'tetrahedron',
                'torusknot',
                'text',
                'group',
              ],
            },
            parentId: { type: ['string', 'null'] },
            attributes: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    z: { type: 'number' },
                  },
                  required: ['x', 'y', 'z'],
                },
                rotation: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    z: { type: 'number' },
                  },
                  required: ['x', 'y', 'z'],
                },
                scale: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    z: { type: 'number' },
                  },
                  required: ['x', 'y', 'z'],
                },
                intensity: { type: 'number' },
                color: { type: 'string' },
                distance: { type: 'number' },
                decay: { type: 'number' },
                geometry: { type: 'array', items: { type: 'number' } },
                material: {
                  type: 'object',
                  properties: {
                    color: { type: 'string' },
                    roughness: { type: 'number' },
                    metalness: { type: 'number' },
                  },
                  required: ['color', 'roughness', 'metalness'],
                },
                radius: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
                widthSegments: { type: 'number' },
                heightSegments: { type: 'number' },
                phiStart: { type: 'number' },
                phiLength: { type: 'number' },
                thetaStart: { type: 'number' },
                thetaLength: { type: 'number' },
                radiusTop: { type: 'number' },
                radiusBottom: { type: 'number' },
                radialSegments: { type: 'number' },
                openEnded: { type: 'boolean' },
                tube: { type: 'number' },
                tubularSegments: { type: 'number' },
                arc: { type: 'number' },
                segments: { type: 'number' },
                innerRadius: { type: 'number' },
                outerRadius: { type: 'number' },
                thetaSegments: { type: 'number' },
                phiSegments: { type: 'number' },
                detail: { type: 'number' },
                p: { type: 'number' },
                q: { type: 'number' },
                text: { type: 'string' },
                size: { type: 'number' },
                curveSegments: { type: 'number' },
                bevelEnabled: { type: 'boolean' },
                bevelThickness: { type: 'number' },
                bevelSize: { type: 'number' },
                bevelSegments: { type: 'number' },
              },
            },
          },
          required: ['id', 'type', 'attributes', 'parentId'],
        },
      },
      required: ['object'],
    },
  },
  {
    name: 'CHANGE_OBJECT_POSITION',
    description: 'Changes the position of an object in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to move',
        },
        position: {
          type: 'number',
          description: 'The new position value',
        },
        coordinate: {
          type: 'string',
          enum: ['x', 'y', 'z'],
          description: 'The coordinate to change (x, y, or z)',
        },
      },
      required: ['objectId', 'position', 'coordinate'],
    },
  },
  {
    name: 'CHANGE_OBJECT_ROTATION',
    description: 'Changes the rotation of an object in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to rotate',
        },
        rotation: {
          type: 'number',
          description: 'The new rotation value in radians',
        },
        coordinate: {
          type: 'string',
          enum: ['x', 'y', 'z'],
          description: 'The coordinate to change (x, y, or z)',
        },
      },
      required: ['objectId', 'rotation', 'coordinate'],
    },
  },
  {
    name: 'CHANGE_OBJECT_SCALE',
    description: 'Changes the scale of an object in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to scale',
        },
        scale: {
          type: 'number',
          description: 'The new scale value',
        },
        coordinate: {
          type: 'string',
          enum: ['x', 'y', 'z'],
          description: 'The coordinate to change (x, y, or z)',
        },
      },
      required: ['objectId', 'scale', 'coordinate'],
    },
  },
  {
    name: 'CHANGE_LIGHT_COLOR',
    description: 'Changes the color of a light in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the light to change',
        },
        color: {
          type: 'string',
          description: 'The new color value in hex format (e.g. "#ffffff")',
        },
      },
      required: ['objectId', 'color'],
    },
  },
  {
    name: 'CHANGE_LIGHT_INTENSITY',
    description: 'Changes the intensity of a light in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the light to change',
        },
        intensity: {
          type: 'number',
          description: 'The new intensity value',
        },
      },
      required: ['objectId', 'intensity'],
    },
  },
  {
    name: 'CHANGE_LIGHT_DISTANCE',
    description: 'Changes the distance of a light in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the light to change',
        },
        distance: {
          type: 'number',
          description: 'The new distance value',
        },
      },
      required: ['objectId', 'distance'],
    },
  },
  {
    name: 'CHANGE_LIGHT_DECAY',
    description: 'Changes the decay rate of a light in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the light to change',
        },
        decay: {
          type: 'number',
          description: 'The new decay value',
        },
      },
      required: ['objectId', 'decay'],
    },
  },
  {
    name: 'REMOVE_OBJECTS',
    description:
      'Removes one or more objects from the scene including their descendants.',
    input_schema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to remove from the scene',
        },
      },
      required: ['objectIds'],
    },
  },
  {
    name: 'RENAME_OBJECT',
    description: 'Renames an object in the scene.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to rename',
        },
        name: {
          type: 'string',
          description: 'The new name for the object',
        },
      },
      required: ['objectId', 'name'],
    },
  },
  {
    name: 'DUPLICATE_OBJECTS',
    description: 'Creates a copy of objects including all their children.',
    input_schema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to duplicate',
        },
      },
      required: ['objectIds'],
    },
  },
  {
    name: 'GROUP_OBJECTS',
    description: 'Groups multiple objects together under a new parent group.',
    input_schema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to group together',
        },
      },
      required: ['objectIds'],
    },
  },
  {
    name: 'CHANGE_OBJECT_METALNESS',
    description: "Changes the metalness property of an object's material.",
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to modify',
        },
        metalness: {
          type: 'number',
          description: 'The new metalness value (0-1)',
        },
      },
      required: ['objectId', 'metalness'],
    },
  },
  {
    name: 'CHANGE_OBJECT_ROUGHNESS',
    description: "Changes the roughness property of an object's material.",
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to modify',
        },
        roughness: {
          type: 'number',
          description: 'The new roughness value (0-1)',
        },
      },
      required: ['objectId', 'roughness'],
    },
  },
  {
    name: 'CHANGE_OBJECT_COLOR',
    description: "Changes the color of an object's material.",
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the object to modify',
        },
        color: {
          type: 'string',
          description: 'The new color value in hex format (e.g. "#ff0000")',
        },
      },
      required: ['objectId', 'color'],
    },
  },
  {
    name: 'CHANGE_PLANE_PROPERTY',
    description: 'Changes a specific property of a plane object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the plane to modify',
        },
        property: {
          type: 'string',
          enum: ['width', 'height', 'widthSegments', 'heightSegments'],
          description: 'The property of the plane to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_SPHERE_PROPERTY',
    description: 'Changes a specific property of a sphere object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the sphere to modify',
        },
        property: {
          type: 'string',
          enum: [
            'radius',
            'widthSegments',
            'heightSegments',
            'phiStart',
            'phiLength',
            'thetaStart',
            'thetaLength',
          ],
          description: 'The property of the sphere to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_CYLINDER_PROPERTY',
    description: 'Changes a specific property of a cylinder object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the cylinder to modify',
        },
        property: {
          type: 'string',
          enum: [
            'radiusTop',
            'radiusBottom',
            'height',
            'radialSegments',
            'heightSegments',
            'openEnded',
            'thetaStart',
            'thetaLength',
          ],
          description: 'The property of the cylinder to change',
        },
        value: {
          type: ['number', 'boolean'],
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_CONE_PROPERTY',
    description: 'Changes a specific property of a cone object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the cone to modify',
        },
        property: {
          type: 'string',
          enum: [
            'radius',
            'height',
            'radialSegments',
            'heightSegments',
            'openEnded',
            'thetaStart',
            'thetaLength',
          ],
          description: 'The property of the cone to change',
        },
        value: {
          type: ['number', 'boolean'],
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_TORUS_PROPERTY',
    description: 'Changes a specific property of a torus object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the torus to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'tube', 'radialSegments', 'tubularSegments', 'arc'],
          description: 'The property of the torus to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_CIRCLE_PROPERTY',
    description: 'Changes a specific property of a circle object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the circle to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'segments', 'thetaStart', 'thetaLength'],
          description: 'The property of the circle to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_RING_PROPERTY',
    description: 'Changes a specific property of a ring object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the ring to modify',
        },
        property: {
          type: 'string',
          enum: [
            'innerRadius',
            'outerRadius',
            'thetaSegments',
            'phiSegments',
            'thetaStart',
            'thetaLength',
          ],
          description: 'The property of the ring to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_DODECAHEDRON_PROPERTY',
    description: 'Changes a specific property of a dodecahedron object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the dodecahedron to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'detail'],
          description: 'The property of the dodecahedron to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_ICOSAHEDRON_PROPERTY',
    description: 'Changes a specific property of an icosahedron object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the icosahedron to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'detail'],
          description: 'The property of the icosahedron to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_OCTAHEDRON_PROPERTY',
    description: 'Changes a specific property of an octahedron object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the octahedron to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'detail'],
          description: 'The property of the octahedron to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_TETRAHEDRON_PROPERTY',
    description: 'Changes a specific property of a tetrahedron object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the tetrahedron to modify',
        },
        property: {
          type: 'string',
          enum: ['radius', 'detail'],
          description: 'The property of the tetrahedron to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_TORUSKNOT_PROPERTY',
    description: 'Changes a specific property of a torus knot object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the torus knot to modify',
        },
        property: {
          type: 'string',
          enum: [
            'radius',
            'tube',
            'tubularSegments',
            'radialSegments',
            'p',
            'q',
          ],
          description: 'The property of the torus knot to change',
        },
        value: {
          type: 'number',
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
  {
    name: 'CHANGE_TEXT_PROPERTY',
    description: 'Changes a specific property of a text object.',
    input_schema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The ID of the text object to modify',
        },
        property: {
          type: 'string',
          enum: [
            'text',
            'size',
            'height',
            'curveSegments',
            'bevelThickness',
            'bevelSize',
            'bevelSegments',
            'bevelEnabled',
          ],
          description: 'The property of the text to change',
        },
        value: {
          type: ['number', 'string', 'boolean'],
          description: 'The new value for the specified property',
        },
      },
      required: ['objectId', 'property', 'value'],
    },
  },
] as ToolUnion[];
