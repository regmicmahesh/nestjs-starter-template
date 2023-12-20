import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '@root/modules_v2/auth/auth.service';
import { Auth0User } from '@root/modules_v2/user/schemas/user';
import { UserService } from '@root/modules_v2/user/services/user';
import { ignoreErrors } from './utils.seeder';
import { ADMIN } from '@root/common/constants';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this.userService = userService;
    this.authService = authService;
  }

  async seed(token: string) {
    const admin = await this.authService.createUser({
      email: `admin@${token}.com`,
      password: `password-${token}@##123456`,
    });

    const adminUser = await this.userService.create({
      _id: admin.user_id,
      email: admin.email,
      firstName: 'admin',
      lastName: 'admin',
      address: 'admin',
      city: 'vicecity',
      postalCode: '1234,',
    });

    this.authService.setRoles(admin.user_id, [ADMIN]);
  }

  async clean(token: string) {
    await ignoreErrors(async () => {
      await this.authService.deleteUserByEmail(`admin@${token}.com`);
    });
  }
}
