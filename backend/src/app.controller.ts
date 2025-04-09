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
    @Res() res: Response,
  ) {
    return this.appService.streamResponse(
      prompt,
      language,
      conversationName,
      res,
    );
  }
}
