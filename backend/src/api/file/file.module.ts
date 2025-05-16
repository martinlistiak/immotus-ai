import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileStashService } from './filestash.service';
import { fileProviders } from './file.providers';
import { DatabaseModule } from '../../database.module';
@Module({
  imports: [DatabaseModule],
  controllers: [FileController],
  providers: [...fileProviders, FileService, FileStashService],
  exports: [...fileProviders, FileService, FileStashService],
})
export class FileModule {}
