import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IAuth0User } from '../../schemas/user';

type OmittedUserFields = '_id' | 'isOnboarded' | 'isStaff';

enum GenderEnum {
  M = 'M',
  F = 'F',
  O = 'O',
}

export class CreateUserDto implements Omit<IAuth0User, OmittedUserFields> {
  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsMongoId()
  country: string;
}

export class CreateUserResponseDto implements IAuth0User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  isOnboarded?: boolean;
  isStaff?: boolean;
  country: string;
}
