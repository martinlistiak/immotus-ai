import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';

config();

interface FileStashItem {
  name: string;
  type: string;
  size?: number;
  time: number;
}

interface FolderStructureItem {
  name: string;
  type: string;
  time: number;
  size?: number;
  contents?: FolderStructureItem[];
}

@Injectable()
export class FileStashService {
  private readonly logger = new Logger(FileStashService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private authCookie: string | undefined;

  constructor() {
    this.apiUrl = process.env.FILESTASH_API_URL!;
    this.apiKey = process.env.FILESTASH_API_KEY || '';

    if (!this.apiKey) {
      this.logger.warn('FILESTASH_API_KEY not set in environment variables');
    }
  }

  private async createSession() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/session`,
        {
          type: 'local',
          password: process.env.FILESTASH_ADMIN_PASSWORD,
          path: '/app/data/state/immotus',
        },
        {
          headers: {
            'x-requested-with': 'XmlHttpRequest',
          },
          withCredentials: true,
        },
      );

      this.authCookie = response.headers?.['set-cookie']?.[0]?.split(';')[0];
      console.log(this.authCookie);
    } catch (error) {
      this.logger.error(
        `Failed to create session: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private async reauthenticateAndRetryOnError<T>(axiosCall: () => Promise<T>) {
    try {
      return await axiosCall();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        await this.createSession();
        return await axiosCall();
      }

      throw err;
    }
  }

  async createUserFolder(userId: number): Promise<boolean> {
    try {
      const folderPath = `/users/${userId}`;
      await this.reauthenticateAndRetryOnError(
        async () =>
          await axios.post(
            `${this.apiUrl}/api/files/mkdir?path=${folderPath}&key=${this.apiKey}`,
            {},
            {
              headers: {
                Cookie: this.authCookie,
              },
            },
          ),
      );
      return true;
    } catch (error) {
      // If folder already exists, consider it a success
      if (error.response?.data?.message === 'File exists') {
        return true;
      }
      this.logger.error(
        `Failed to create folder for user ${userId}: ${error.message || 'Unknown error'}`,
      );
      return false;
    }
  }

  async uploadFile(
    userId: number,
    file: Express.Multer.File,
    subFolder = '',
  ): Promise<string> {
    try {
      // Ensure user folder exists
      await this.createUserFolder(userId);

      const folderPath = `/users/${userId}${subFolder ? `/${subFolder}` : ''}`;

      // Ensure subFolder exists if specified
      if (subFolder) {
        await this.reauthenticateAndRetryOnError(
          async () =>
            await axios.post(
              `${this.apiUrl}/api/files/mkdir?path=${folderPath}&key=${this.apiKey}`,
              {},
              {
                headers: {
                  Cookie: this.authCookie,
                },
              },
            ),
        );
      }

      const filePath = `${folderPath}/${file.originalname}`;

      // Upload file
      await this.reauthenticateAndRetryOnError(
        async () =>
          await axios.post(
            `${this.apiUrl}/api/files/cat?path=${filePath}&key=${this.apiKey}`,
            file.buffer,
            {
              headers: {
                'Content-Type': 'application/octet-stream',
                Cookie: this.authCookie,
              },
            },
          ),
      );

      return filePath;
    } catch (error) {
      this.logger.error(`Failed to upload file for user ${userId}:`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/files/cat?path=${filePath}&key=${this.apiKey}`,
        {
          responseType: 'arraybuffer',
          headers: {
            Cookie: this.authCookie,
          },
        },
      );
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download file ${filePath}:`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await this.reauthenticateAndRetryOnError(
        async () =>
          await axios.post(
            `${this.apiUrl}/api/files/rm?path=${filePath}&key=${this.apiKey}`,
            {},
            {
              headers: {
                Cookie: this.authCookie,
              },
            },
          ),
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${filePath}: ${error.message || 'Unknown error'}`,
      );
      return false;
    }
  }

  async listFolderContents(folderPath: string): Promise<FileStashItem[]> {
    try {
      const response = await this.reauthenticateAndRetryOnError(
        async () =>
          await axios.get(
            `${this.apiUrl}/api/files/ls?path=${folderPath}&key=${this.apiKey}`,
            {
              headers: {
                Cookie: this.authCookie,
              },
            },
          ),
      );
      return (response.data.results || []) as FileStashItem[];
    } catch (error) {
      this.logger.error(
        `Failed to list folder ${folderPath}: ${error.message || 'Unknown error'}`,
      );
      return [];
    }
  }

  async getUserFolderStructure(userId: number): Promise<FolderStructureItem[]> {
    const folderPath = `/users/${userId}`;

    // Ensure user folder exists
    await this.createUserFolder(userId);

    return this.getFolderStructure(folderPath);
  }

  private async getFolderStructure(
    folderPath: string,
  ): Promise<FolderStructureItem[]> {
    const contents = await this.listFolderContents(folderPath);
    const result: FolderStructureItem[] = [];

    for (const item of contents) {
      if (item.type === 'directory') {
        const subFolderContents = await this.getFolderStructure(
          `${folderPath}/${item.name}`,
        );
        result.push({
          name: item.name,
          type: 'directory',
          time: item.time,
          contents: subFolderContents,
        });
      } else {
        result.push({
          name: item.name,
          type: 'file',
          size: item.size,
          time: item.time,
        });
      }
    }

    return result;
  }
}
