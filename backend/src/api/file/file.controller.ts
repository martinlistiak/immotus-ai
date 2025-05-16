import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { File } from '../../entities/File.entity';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20)) // Max 20 files at once
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<File[]> {
    return this.fileService.uploadFiles(
      files,
      uploadFileDto.userId,
      uploadFileDto.description,
      uploadFileDto.folder,
    );
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<File[]> {
    return this.fileService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<File | null> {
    return this.fileService.findOne(id);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, file } = await this.fileService.downloadFile(id);

    res.set({
      'Content-Type': file.type,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    const success = await this.fileService.remove(id);
    return { success };
  }

  @Get('structure/:userId')
  async getFolderStructure(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.fileService.getFolderStructure(userId);
  }
}
