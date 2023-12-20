import { Body, Controller, Get, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { Auth, User } from '../auth/auth.decorator';
import { IUser } from '../auth/auth.service';
import { UploadDto } from './files.dto';

@Controller('files')
@Auth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @Auth()
  async upload(@User('sub') tenantId: string, @Body() body: UploadDto) {
    const { filename } = body;

    const uploadResponse = await this.filesService.uploadFile(
      filename,
      tenantId,
    );

    return uploadResponse;
  }
}
