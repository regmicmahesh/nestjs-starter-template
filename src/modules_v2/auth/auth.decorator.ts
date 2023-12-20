import {
  ExecutionContext,
  InternalServerErrorException,
  SetMetadata,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard, RolesGuard } from './auth.guard';
import { IUser } from './auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ROLE_TYPES } from '@root/common/constants';

export const Auth = (...roles: ROLE_TYPES[]) => {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
};

export const User = createParamDecorator(
  (data: keyof IUser | undefined, context: ExecutionContext): IUser => {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new InternalServerErrorException(
        'req.user is not assigned. Please check if you have AuthGuard in your controller',
      );
    }
    if (typeof data == 'string') {
      return user[data];
    }

    return user;
  },
);
