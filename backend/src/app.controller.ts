import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConversationService } from './api/conversation/conversation.service';
import { User } from './decorators/user.decorator';
import { User as UserEntity } from './entities/User.entity';

@Controller()
export class AppController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(@UploadedFile() file: any, @Res() res: Response) {
    const { text, language } = await this.conversationService.speechToText(
      file.buffer,
    );
    return res.json({ text, language });
  }

  @Get('stream-response')
  async streamResponse(
    @Query('prompt') prompt: string,
    @Query('language') language: string,
    @Query('conversationId') conversationId: number,
    @Query('sceneId') sceneId: number,
    @User() user: UserEntity,
    @Res() res: Response,
  ) {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.conversationService.streamResponse(
        prompt,
        language,
        Number(conversationId),
        Number(sceneId),
        user.id,
        res,
      );

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
