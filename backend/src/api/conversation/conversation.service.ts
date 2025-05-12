import { Inject, Injectable } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { Repository } from 'typeorm';
import { Conversation as ConversationEntity } from '../../entities/Conversation.entity';
import { ElevenLabsClient } from 'elevenlabs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { tools } from '../../tools';
import { ToolUnion, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { SceneObjects } from '../../types/scene-ast';
import { SceneService } from '../scene/scene.service';
export type ConversationType = Anthropic.Messages.MessageParam[];
dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const anthropic = new Anthropic();

@Injectable()
export class ConversationService {
  constructor(
    @Inject('CONVERSATION_REPOSITORY')
    private conversationRepository: Repository<ConversationEntity>,
    private sceneService: SceneService,
  ) {}

  getConversations({ userId }: { userId: number }) {
    return this.conversationRepository.find({ where: { userId } });
  }

  getConversation({ id, userId }: { id: number; userId: number }) {
    return this.conversationRepository.findOne({ where: { id, userId } });
  }

  async createConversation({
    conversation,
    userId,
  }: {
    conversation: ConversationType;
    userId: number;
  }) {
    const conv = this.conversationRepository.create({
      conversation,
      userId,
      name: 'Untitled',
    });

    await this.conversationRepository.save(conv);

    return this.conversationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateConversation({
    id,
    name,
    conversation,
    userId,
  }: {
    id: number;
    name?: string;
    conversation: ConversationType;
    userId: number;
  }) {
    await this.conversationRepository.update(
      { id, userId },
      // @ts-ignore
      { name, conversation },
    );

    return this.conversationRepository.findOne({
      where: { id, userId },
    });
  }

  renameConversation({
    id,
    newName,
    userId,
  }: {
    id: number;
    newName: string;
    userId: number;
  }) {
    return this.conversationRepository.update(
      { id, userId },
      { name: newName },
    );
  }

  deleteConversation({ id, userId }: { id: number; userId: number }) {
    return this.conversationRepository.delete({ id, userId });
  }

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
    conversationId: number | null,
    sceneId: number,
    userId: number,
    res: Response,
  ) {
    let conversation: Anthropic.Messages.MessageParam[] = [];
    let conversationIdForUpdate: number | null = conversationId;
    if (!conversationId) {
      const createdConversation = await this.createConversation({
        conversation: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        userId,
      });

      conversationIdForUpdate = createdConversation!.id;
      conversation = [
        {
          role: 'user',
          content: prompt,
        },
      ];
    } else {
      conversation =
        (
          await this.getConversation({
            id: conversationId,
            userId,
          })
        )?.conversation || [];

      await this.updateConversation({
        id: conversationId,
        userId,
        conversation: [
          ...conversation,
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    }

    const newMessages = [
      ...conversation,
      { role: 'user', content: prompt },
    ] as Anthropic.Messages.MessageParam[];

    // Create a streaming response to handle tool usage
    const stream = anthropic.messages.stream({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 64000,
      temperature: 0.3,
      system:
        "You are 3d designer, an architect and a interior designer. You are assisting with creating beautiful interior models. When modeling 1 meter equals 1 in scale. Always put tool_use into a separate content message.\n\nIMPORTANT RULES FOR TOOLS:\n1. When using the SET_SCENE tool, you MUST provide a complete scene object in the input.scene property following the schema exactly with all required fields (id, name, description, createdAt, updatedAt, objects array with all their required attributes).\n2. When using ADD_OBJECT, ensure all required object properties are provided (id, type, attributes, parentId).\n3. NEVER send empty objects or undefined values as tool inputs. Each tool requires specific parameters as defined in its schema.\n4. Before calling a tool, first analyze whether you have ALL the required information for the tool inputs.\n5. If you don't have all required information for a tool, DO NOT call the tool - instead ask the user for the missing information first.\n6. For all position/rotation/scale changes, specify the exact objectId, coordinate, and numeric value.\n7. When generating a new scene, always provide realistic values for all fields (never leave any empty).",
      messages: newMessages,
      tools: tools as unknown as ToolUnion[],
      tool_choice: { type: 'any' },
    });

    // Check if a tool was used
    let textContent = '';
    const toolCalls: ToolUseBlock[] = [];

    // Handle the streaming response
    try {
      for await (const event of stream) {
        console.log(event);
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
            await this.updateConversation({
              id: conversationIdForUpdate!,
              userId,
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
        const scene = input.scene as SceneObjects | undefined;

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
        const scene = await this.sceneService.getSceneById({
          id: sceneId,
        });

        // Add the scene as an assistant message to the conversation history
        newMessages.push({
          role: 'assistant',
          content: `Here is the current scene: ${JSON.stringify(scene)}`,
        });
        await this.updateConversation({
          id: conversationIdForUpdate!,
          userId,
          conversation: newMessages,
        });

        // Continue the conversation with the original user prompt
        // (the last user message in newMessages)
        const lastUserMessage = [...newMessages]
          .reverse()
          .find((m) => m.role === 'user');
        const nextPrompt =
          typeof lastUserMessage?.content === 'string'
            ? lastUserMessage.content
            : '';

        // Call the LLM again, but now with the updated conversation history
        await this.streamResponse(
          nextPrompt,
          language,
          conversationIdForUpdate,
          sceneId,
          userId,
          res,
        );
        // Prevent further processing in this loop
        return;
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
