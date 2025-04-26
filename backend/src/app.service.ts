import { Injectable } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { tools } from './tools';
import { ToolUnion, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { ConversationService } from './api/conversation/conversation.service';
import { SceneType } from './types/scene-ast';
import { SceneService } from './api/scene/scene.service';
dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const anthropic = new Anthropic();

@Injectable()
export class AppService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly sceneService: SceneService,
  ) {}
  async speechToText(
    audioBuffer: Buffer,
  ): Promise<{ text: string; language: string }> {
    // Create temporary file from buffer
    const tempFilePath = path.join(os.tmpdir(), `speech-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Create a fresh stream for each request
      const fileStream = fs.createReadStream(tempFilePath);

      const result = await client.speechToText.convert({
        file: fileStream,
        model_id: 'scribe_v1',
      });

      console.log(result);
      return { text: result.text, language: result.language_code };
    } catch (error) {
      console.error('Error in speech to text conversion:', error);
      throw error;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  async streamResponse(
    prompt: string,
    language: string,
    conversationName: string,
    sceneName: string,
    res: Response,
  ) {
    let conversation: Anthropic.Messages.MessageParam[] = [];
    try {
      conversation = this.conversationService.getConversation({
        name: conversationName,
      });
    } catch (error) {
      console.error(error);

      this.conversationService.upsertConversation({
        name: conversationName,
        conversation: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      conversation = [
        {
          role: 'user',
          content: prompt,
        },
      ];
    }

    // Create a streaming response to handle tool usage
    const stream = await anthropic.messages.stream({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 64000,
      temperature: 0.3,
      system:
        "You are 3d designer, an architect and a interior designer. You are assisting with creating beautiful interior models. When modeling 1 meter equals 1 in scale. Always put tool_use into a separate content message.\n\nIMPORTANT RULES FOR TOOLS:\n1. When using the SET_SCENE tool, you MUST provide a complete scene object in the input.scene property following the schema exactly with all required fields (id, name, description, createdAt, updatedAt, objects array with all their required attributes).\n2. When using ADD_OBJECT, ensure all required object properties are provided (id, type, attributes, parentId).\n3. NEVER send empty objects or undefined values as tool inputs. Each tool requires specific parameters as defined in its schema.\n4. Before calling a tool, first analyze whether you have ALL the required information for the tool inputs.\n5. If you don't have all required information for a tool, DO NOT call the tool - instead ask the user for the missing information first.\n6. For all position/rotation/scale changes, specify the exact objectId, coordinate, and numeric value.\n7. When generating a new scene, always provide realistic values for all fields (never leave any empty).",
      messages: [
        ...(conversation || []),
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: tools as unknown as ToolUnion[],
      tool_choice: { type: 'any' },
    });

    const newMessages = [
      ...conversation,
      { role: 'user', content: prompt },
    ] as Anthropic.Messages.MessageParam[];

    // Check if a tool was used
    let textContent = '';
    const toolCalls: ToolUseBlock[] = [];

    // Handle the streaming response
    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta;

          if ('text' in delta) {
            textContent += delta.text;
            // Send the text update
            res.write(
              `data: ${JSON.stringify({
                type: 'text',
                content: delta.text,
              })}\n\n`,
            );
          }
        } else if (
          event.type === 'content_block_start' &&
          event.content_block.type === 'tool_use'
        ) {
          // Initialize a new tool use block
          toolCalls.push(event.content_block);
        } else if (event.type === 'message_stop') {
          // Process any tool calls when message is complete
          if (textContent.trim()) {
            newMessages.push({ role: 'assistant', content: textContent });
            this.conversationService.upsertConversation({
              name: 'default',
              conversation: newMessages,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming response:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`,
      );
    }

    // Log the completed response
    console.log('Claude response complete');

    // Process any tool calls
    for (const toolCall of toolCalls) {
      newMessages.push({
        role: 'assistant',
        content: JSON.stringify({
          type: 'tool_use',
          tool_name: toolCall.name,
          tool_input: toolCall.input,
        }),
      });

      if (toolCall.name === 'SET_SCENE') {
        // Log the tool call input for debugging
        console.log('SET_SCENE tool input:', JSON.stringify(toolCall.input));

        // Access scene with proper type safety
        const input = toolCall.input as Record<string, unknown>;
        const scene = input.scene as SceneType | undefined;

        if (!scene) {
          console.error('Error: SET_SCENE tool called with empty scene input');
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'SET_SCENE tool called with empty scene input',
            })}\n\n`,
          );
          continue;
        }

        // Validate required fields in the scene object
        const requiredSceneFields = [
          'id',
          'name',
          'description',
          'createdAt',
          'updatedAt',
          'objects',
        ];
        const missingFields = requiredSceneFields.filter(
          (field) => !scene[field],
        );

        if (missingFields.length > 0) {
          console.error(
            `Error: SET_SCENE missing required fields: ${missingFields.join(', ')}`,
          );
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: `SET_SCENE missing required fields: ${missingFields.join(', ')}`,
            })}\n\n`,
          );
          continue;
        }

        // Send a scene update event to the client
        res.write(
          `data: ${JSON.stringify({
            type: 'tool_use',
            content: {
              type: 'SET_SCENE',
              scene,
            },
          })}\n\n`,
        );
      } else if (toolCall.name === 'GET_SCENE') {
        // get current scene from the file
        const scene = this.sceneService.getScene({
          name: sceneName,
        });

        res.write(
          `data: ${JSON.stringify({
            type: 'tool_use',
            content: {
              type: 'GET_SCENE',
              scene,
            },
          })}\n\n`,
        );

        const updatedConversation = conversation.filter((message) => {
          const content = message.content;
          return (
            typeof content === 'string' &&
            !content.includes('This is the current scene:')
          );
        });

        // upsert into conversation
        this.conversationService.upsertConversation({
          name: conversationName,
          conversation: [
            ...updatedConversation,
            {
              role: 'assistant',
              content: `This is the current scene: ${JSON.stringify(scene)}`,
            },
          ],
        });

        await this.streamResponse(
          `This is the current scene: ${JSON.stringify(scene)}`,
          language,
          conversationName,
          sceneName,
          res,
        );
      } else if (toolCall.name === 'ADD_OBJECT') {
        // Access object with proper type safety
        const input = toolCall.input as Record<string, unknown>;
        const object = input.object;

        if (!object) {
          console.error(
            'Error: ADD_OBJECT tool called with empty object input',
          );
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'ADD_OBJECT tool called with empty object input',
            })}\n\n`,
          );
          continue;
        }

        // Type guard to check if object has required structure
        const isValidObject = (
          obj: unknown,
        ): obj is Record<string, unknown> => {
          return typeof obj === 'object' && obj !== null;
        };

        if (!isValidObject(object)) {
          console.error(
            'Error: ADD_OBJECT tool called with invalid object input',
          );
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'ADD_OBJECT tool called with invalid object input',
            })}\n\n`,
          );
          continue;
        }

        // Validate required fields for the object
        const requiredObjectFields = ['id', 'type', 'attributes', 'parentId'];
        const missingFields = requiredObjectFields.filter(
          (field) => object[field] === undefined,
        );

        if (missingFields.length > 0) {
          console.error(
            `Error: ADD_OBJECT missing required fields: ${missingFields.join(', ')}`,
          );
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: `ADD_OBJECT missing required fields: ${missingFields.join(', ')}`,
            })}\n\n`,
          );
          continue;
        }

        // Pass the tool call to the client
        res.write(
          `data: ${JSON.stringify({
            type: 'tool_use',
            content: {
              type: 'ADD_OBJECT',
              object,
            },
          })}\n\n`,
        );
      } else {
        // For other tools, just forward the tool call to the client
        const inputData = toolCall.input as Record<string, unknown>;

        res.write(
          `data: ${JSON.stringify({
            type: 'tool_use',
            content: {
              type: toolCall.name,
              ...inputData,
            },
          })}\n\n`,
        );
      }
    }
  }
}
