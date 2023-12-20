import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth0User, IAuth0User } from '../schemas/user';
import { Repository } from '@root/common/repository';
import { AuthService } from '@root/modules_v2/auth/auth.service';

@Injectable()
export class UserService extends Repository<Auth0User, IAuth0User> {
  private readonly authService: AuthService;

  constructor(
    @InjectModel(Auth0User.name)
    model: Model<Auth0User>,
    authService: AuthService,
  ) {
    super();
    this.model = model;
    this.authService = authService;
  }

  override async create(createUserDto: IAuth0User) {
    const user = await super.create(createUserDto);
    return user;
  }
}
