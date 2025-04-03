import { Express } from 'express';

export interface BufferedFileDto extends Express.Multer.File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  buffer: Buffer;
}

export type AppMimeType = 'image/png' | 'image/jpeg' | 'image/jpg';
