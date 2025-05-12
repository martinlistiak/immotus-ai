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
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async speechToText(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const { text, language } = await this.appService.speechToText(file.buffer);
    return res.json({ text, language });
  }

  @Get('stream-response')
  async streamResponse(
    @Query('prompt') prompt: string,
    @Query('language') language: string,
    @Query('conversationName') conversationName: string,
    @Query('sceneId') sceneId: number,
    @Res() res: Response,
  ) {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.appService.streamResponse(
        prompt,
        language,
        conversationName,
        Number(sceneId),
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
