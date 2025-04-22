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

    // Create a non-streaming response first to handle tool usage
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 8000,
      temperature: 0.3,
      system:
        'You are 3d designer, an architect and a interior designer. You are assisting with creating beautiful interior models. When modeling 1 meter equals 1 in scale. Always put tool_use into a separate content message. When using the SET_SCENE tool, you MUST provide a complete scene object in the input.scene property following the schema exactly.',
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

    console.log(response.content);

    const newMessages = [
      ...conversation,
      { role: 'user', content: prompt },
    ] as Anthropic.Messages.MessageParam[];

    // Check if a tool was used
    let textContent = '';
    const toolCalls: ToolUseBlock[] = [];

    // Extract text from the response
    if (response.content) {
      for (const content of response.content) {
        if (content.type === 'text') {
          textContent += content.text;
          newMessages.push({ role: 'assistant', content: content.text });
        } else if (content.type === 'tool_use') {
          toolCalls.push(content);
          newMessages.push({
            role: 'assistant',
            content: JSON.stringify({
              type: 'tool_use',
              tool_name: content.name,
              tool_input: content.input,
            }),
          });
        }
      }
    }

    // Only if we have text to convert to speech
    if (textContent.trim()) {
      // Generate speech from the text
      // const audioStream = await client.textToSpeech.convert(
      //   '21m00Tcm4TlvDq8ikWAM', // voice ID
      //   {
      //     text: textContent,
      //     model_id: 'eleven_turbo_v2_5',
      //   },
      // );

      // // Convert the audioStream to base64
      // const chunks: Buffer[] = [];
      // for await (const chunk of audioStream) {
      //   chunks.push(Buffer.from(chunk));
      // }
      // const audioBuffer = Buffer.concat(chunks);
      // const base64Audio = audioBuffer.toString('base64');

      // // Send the audio chunk to the client
      // res.write(
      //   `data: ${JSON.stringify({
      //     type: 'audio',
      //     content: base64Audio,
      //     text: textContent,
      //   })}\n\n`,
      // );

      // Send the text update
      res.write(
        `data: ${JSON.stringify({
          type: 'text',
          content: textContent,
        })}\n\n`,
      );

      this.conversationService.upsertConversation({
        name: 'default',
        conversation: newMessages,
      });
    }

    // Process any tool calls
    for (const toolCall of toolCalls) {
      if (toolCall.name === 'SET_SCENE') {
        // Log the tool call input for debugging
        console.log('SET_SCENE tool input:', JSON.stringify(toolCall.input));

        // @ts-ignore
        const scene = toolCall.input.scene;

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
              scene: scene as SceneType,
            },
          })}\n\n`,
        );
      }
      if (toolCall.name === 'GET_SCENE') {
        // get current scene from the file
        const scene = this.sceneService.getScene({
          name: sceneName,
        });

        res.write(
          `data: ${JSON.stringify({
            type: 'tool_use',
            content: {
              type: 'GET_SCENE',
              scene: scene as SceneType,
            },
          })}\n\n`,
        );

        const updatedConversation = conversation.filter(
          // @ts-ignore
          (message) => !message.content.includes('This is the current scene:'),
        );

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
      }
    }
  }
}
