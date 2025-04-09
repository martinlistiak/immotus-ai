import { ToolUnion } from '@anthropic-ai/sdk/resources';

export const tools = [
  {
    name: 'SET_SCENE',
    description: 'Set the scene for the 3d model',
    input_schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
                    enum: ['box', 'light', 'mesh', 'sphere'],
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
                      type: { enum: ['box', 'sphere'] },
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  },
] as ToolUnion[];
