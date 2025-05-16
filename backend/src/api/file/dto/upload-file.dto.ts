export class UploadFileDto {
  description: string;
  userId: number;
  folder?: string; // Optional folder path where the file should be stored
}
