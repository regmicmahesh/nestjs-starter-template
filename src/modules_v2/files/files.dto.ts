import { IsString } from 'class-validator';

// Convention: DTOs are named with a suffix of "Dto".
// Should match the method name in the controller.
export class UploadDto {
  @IsString()
  filename: string;
}
