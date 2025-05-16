import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { File } from '../../entities/File.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { FileStashService } from './filestash.service';
import * as path from 'path';

interface FolderStructureItem {
  name: string;
  type: string;
  time: number;
  size?: number;
  contents?: FolderStructureItem[];
  id?: number;
  description?: string | null;
  extension?: string;
  thumbnailUrl?: string | null;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @Inject('FILE_REPOSITORY')
    private readonly fileRepository: Repository<File>,
    private readonly fileStashService: FileStashService,
  ) {}

  async create(createFileDto: CreateFileDto): Promise<File> {
    const file = this.fileRepository.create(createFileDto);
    return this.fileRepository.save(file);
  }

  async findAll(): Promise<File[]> {
    return this.fileRepository.find();
  }

  async findByUser(userId: number): Promise<File[]> {
    return this.fileRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<File | null> {
    return this.fileRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<boolean> {
    const file = await this.findOne(id);
    if (!file) {
      return false;
    }

    // Delete from FileStash
    await this.fileStashService.deleteFile(file.path);

    // Delete from database
    await this.fileRepository.remove(file);
    return true;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    userId: number,
    description: string,
    folder?: string,
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];

    for (const file of files) {
      try {
        // Upload to FileStash
        const filePath = await this.fileStashService.uploadFile(
          userId,
          file,
          folder,
        );

        // Get file extension
        const extension = path.extname(file.originalname).substring(1); // Remove the dot

        // Create file record in database
        const fileEntity = await this.create({
          name: file.originalname,
          path: filePath,
          extension,
          type: file.mimetype,
          size: file.size,
          url: filePath, // URL to access the file via FileStash
          userId,
          description,
        });

        uploadedFiles.push(fileEntity);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error);
        // Continue with next file
        continue;
      }
    }

    return uploadedFiles;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; file: File }> {
    const file = await this.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const buffer = await this.fileStashService.downloadFile(file.path);
    return { buffer, file };
  }

  async getFolderStructure(userId: number): Promise<FolderStructureItem[]> {
    // Get the folder structure from FileStash
    const structure =
      await this.fileStashService.getUserFolderStructure(userId);

    // Get all files for this user from database
    const dbFiles = await this.findByUser(userId);

    // Enhance the structure with database metadata
    return this.enhanceFolderStructure(structure, dbFiles);
  }

  private enhanceFolderStructure(
    structure: FolderStructureItem[],
    dbFiles: File[],
    currentPath = '/users',
  ): FolderStructureItem[] {
    return structure.map((item) => {
      const itemPath = `${currentPath}/${item.name}`;

      if (item.type === 'directory' && item.contents) {
        return {
          ...item,
          contents: this.enhanceFolderStructure(
            item.contents,
            dbFiles,
            itemPath,
          ),
        };
      } else if (item.type === 'file') {
        // Find matching file in database
        const dbFile = dbFiles.find((f) => f.path === itemPath);

        if (dbFile) {
          return {
            ...item,
            id: dbFile.id,
            description: dbFile.description,
            extension: dbFile.extension,
            thumbnailUrl: dbFile.thumbnailUrl,
          };
        }
      }

      return item;
    });
  }
}
