import { Injectable } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { tools } from './tools';
import { ToolUnion } from '@anthropic-ai/sdk/resources';
import { ConversationService } from './api/conversation/conversation.service';
dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const anthropic = new Anthropic();

@Injectable()
export class AppService {
  constructor(private readonly conversationService: ConversationService) {}
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
    res: Response,
  ) {
    try {
      let conversation: Anthropic.Messages.MessageParam[] = [];
      try {
        conversation = this.conversationService.getConversation({
          name: conversationName,
        });
      } catch (error) {
        console.error(error);
      }

      // Create a non-streaming response first to handle tool usage
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 8000,
        temperature: 0.3,
        system:
          'You are 3d designer, an architect and a interior designer. You are assisting with creating beautiful interior models. When modeling 1 meter equals 1 in scale.',
        messages: [
          ...(conversation || []),
          {
            role: 'user',
            content: prompt,
          },
        ],
        tools: tools as unknown as ToolUnion[],
      });

      console.log(response.content);

      const newMessages = [
        ...conversation,
        { role: 'user', content: prompt },
      ] as Anthropic.Messages.MessageParam[];

      // Set headers for server-sent events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Check if a tool was used
      let textContent = '';
      const toolCalls: any[] = [];

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

      // Process any tool calls
      for (const toolCall of toolCalls) {
        if (toolCall.name === 'SET_SCENE') {
          const scene = toolCall.input.scene;
          if (scene) {
            // Send a scene update event to the client
            res.write(
              `data: ${JSON.stringify({
                type: 'tool_use',
                content: scene,
              })}\n\n`,
            );
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

      // Send the completion event
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error in streaming response:', error);
      // Type assertion for error message
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`,
      );
      res.end();
    }
  }
}
