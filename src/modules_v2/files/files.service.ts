import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import path from 'path';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: configService.get('aws').accessKeyId,
        secretAccessKey: configService.get('aws').secretAccessKey,
      },
      region: configService.get('aws').region,
      endpoint: configService.get('aws').endpoint,
    });
    this.bucketName = configService.get('aws').bucketName;
  }

  async generatePostUrl(key: string, expiration: number = 60 * 60 * 24) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiration,
    });
    return url;
  }

  async generateGetUrl(key: string, expiration: number) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiration,
    });
    return url;
  }

  async verifyFileExists(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    try {
      const response = await this.s3Client.send(command);
      return response.$metadata.httpStatusCode === 200;
    } catch (e) {
      return false;
    }
  }

  // use this check when associating files with a tenant.
  static isFileOwnedByTenant(key: string, tenantId: string) {
    return key.startsWith(`${tenantId}/`);
  }

  static sanitizeFilename(filename: string) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '');
    return path.join(sanitizedFilename);
  }

  async uploadFile(filename: string, tenantId: string) {
    const sanitizedFilename = FilesService.sanitizeFilename(filename);
    const randomKeyPart = randomBytes(16).toString('hex');

    const s3Key = `${tenantId}/${randomKeyPart}-${sanitizedFilename}`;

    const url = await this.generatePostUrl(s3Key);
    return { url, key: s3Key };
  }
}
