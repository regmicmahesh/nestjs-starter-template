import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import jwksClient from 'jwks-rsa';
import { ManagementClient } from 'auth0';

export interface IUser {
  // jwt claims
  iss: string;
  sub: string;
  aud: string[];
  scope: string;

  // set via roles in auth0
  roles: string[];
}

interface IAuthService {
  validateToken(token: string): Promise<IUser>;
}

type CreateUserCredentials = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly jwksClient: jwksClient.JwksClient;
  private readonly auth0Client: ManagementClient;

  constructor(configService: ConfigService) {
    const jwksUri = configService.get<string>('auth0.jwkUrl');

    this.jwksClient = jwksClient({
      jwksUri,
      cache: true,
      cacheMaxAge: 1000 * 60 * 60 * 24, // 24 hours
    });

    this.auth0Client = new ManagementClient({
      domain: configService.get<string>('auth0.management.tenant'),
      clientId: configService.get<string>('auth0.management.clientId'),
      clientSecret: configService.get<string>('auth0.management.secretId'),
    });
  }

  async validateToken(token: string): Promise<IUser> {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      const kid = decodedToken.header.kid;
      const signingKey = await this.jwksClient.getSigningKey(kid);
      const tokenData = jwt.verify(token, signingKey.getPublicKey());
      return tokenData as IUser;
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('JWT token has either expired or invalid');
    }
  }

  async getRoles(userId: string): Promise<string[]> {
    const roles = await this.auth0Client.users.getRoles({ id: userId });
    if (roles.status !== HttpStatus.OK) {
      this.logger.error("Unable to fetch user's roles", roles);
      throw new BadRequestException('Unable to fetch roles');
    }
    return roles.data.map((role) => role.name) as string[];
  }

  async hasRoles(userId: string, roles: string[]) {
    const userRoles = await this.getRoles(userId);
    this.logger.log(userRoles);
    return roles.every((role) => userRoles.includes(role));
  }

  async setRoles(userId: string, roles: string[]) {
    try {
      const rolesPromises = roles.map(async (id) => {
        const { data } = await this.auth0Client.roles.getAll({
          name_filter: id,
        });

        if (data.length === 0) {
          this.logger.error(`Unable to find role ${id}`);
          throw new InternalServerErrorException('Unable to set roles');
        }

        const response = await this.auth0Client.roles.assignUsers(
          { id: data[0].id },
          { users: [userId] },
        );

        if (response.status !== HttpStatus.OK) {
          this.logger.error("Unable to set user's roles", response);
          throw new BadRequestException('Unable to set roles');
        }
        return response;
      });

      await Promise.all(rolesPromises);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Unable to set roles');
    }
  }

  async verifyUserExists(userId: string) {
    const user = await this.auth0Client.users.get({ id: userId });
    if (user.status !== HttpStatus.OK) {
      this.logger.error('Unable to fetch user', user);
      throw new BadRequestException('User does not exist');
    }
  }

  async fetchUserMetadata(auth0UserId: string) {
    const { data: user } = await this.auth0Client.users.get({
      id: auth0UserId,
    });
    return user.user_metadata;
  }

  async createUser(credentials: CreateUserCredentials) {
    const { data: user } = await this.auth0Client.users.create({
      connection: 'Username-Password-Authentication',
      ...credentials,
      email_verified: true,
    });

    return user;
  }

  async deleteUser(id: string) {
    const response = await this.auth0Client.users.delete({ id });
    return response;
  }

  async deleteUserByEmail(email: string) {
    const { data } = await this.auth0Client.usersByEmail.getByEmail({ email });
    await this.deleteUser(data[0].user_id);
  }
}
