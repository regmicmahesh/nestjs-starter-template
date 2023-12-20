import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;

    if (!bearerToken) {
      return false;
    }
    const token = bearerToken.split(' ')[1];

    if (!token) {
      return false;
    }

    const data = await this.authService.validateToken(token);
    request.user = data;

    this.logger.assign({ userId: data.sub });

    return !!data;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRoles = await this.authService.getRoles(user.sub);

    const result = requiredRoles.some((role) => userRoles.includes(role));
    if (!result) {
      this.logger.error(
        `User ${user.sub} does not have required roles "${requiredRoles}"`,
      );
      this.logger.error(`User ${user.sub} has roles "${userRoles}"`);
      return false;
    }

    user.roles = userRoles;

    user.isAdmin = () => {
      return userRoles.includes('ADMIN');
    };

    return true;
  }
}
