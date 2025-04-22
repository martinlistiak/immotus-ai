import { ToolUnion } from '@anthropic-ai/sdk/resources';

export const tools = [
  {
    name: 'SET_SCENE',
    description: 'Set the scene for the 3d model',
    input_schema: {
      type: 'object',
      properties: {
        scene: {
          type: 'object',
          description: 'Clears the scene and sets the new scene',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
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
                      // Common primitive properties
                      radius: { type: 'number' },
                      width: { type: 'number' },
                      height: { type: 'number' },
                      widthSegments: { type: 'number' },
                      heightSegments: { type: 'number' },

                      // Sphere properties
                      phiStart: { type: 'number' },
                      phiLength: { type: 'number' },
                      thetaStart: { type: 'number' },
                      thetaLength: { type: 'number' },

                      // Cylinder properties
                      radiusTop: { type: 'number' },
                      radiusBottom: { type: 'number' },
                      radialSegments: { type: 'number' },
                      openEnded: { type: 'boolean' },

                      // Torus properties
                      tube: { type: 'number' },
                      tubularSegments: { type: 'number' },
                      arc: { type: 'number' },

                      // Circle properties
                      segments: { type: 'number' },

                      // Ring properties
                      innerRadius: { type: 'number' },
                      outerRadius: { type: 'number' },
                      thetaSegments: { type: 'number' },
                      phiSegments: { type: 'number' },

                      // Polyhedron properties
                      detail: { type: 'number' },

                      // TorusKnot properties
                      p: { type: 'number' },
                      q: { type: 'number' },

                      // Text properties
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
          required: [
            'id',
            'name',
            'description',
            'createdAt',
            'updatedAt',
            'objects',
          ],
        },
      },
      required: ['scene'],
    },
  },
  {
    name: 'GET_SCENE',
    description:
      'Gets the current scene. In order to save on token usage, use this tool only when necessary.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
] as ToolUnion[];
