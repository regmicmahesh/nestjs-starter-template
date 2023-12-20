import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/services/user';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth0User, Auth0UserSchema } from '../user/schemas/user';

@Module({
  providers: [FilesService, AuthService, UserService],
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: Auth0User.name,
        schema: Auth0UserSchema,
      },
    ]),
  ],

  controllers: [FilesController],
})
export class FilesModule {}
