export class CreateFileDto {
  name: string;
  path: string;
  extension: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  userId: number;
  description: string;
}
