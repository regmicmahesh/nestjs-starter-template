import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UserController } from './controllers/user';
import { Auth0User, Auth0UserSchema } from './schemas/user';
import { UserService } from './services/user';

@Module({
  controllers: [UserController],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Auth0User.name,
        schema: Auth0UserSchema,
      },
    ]),
  ],
  providers: [UserService, AuthService],
})
export class UserModule {}
