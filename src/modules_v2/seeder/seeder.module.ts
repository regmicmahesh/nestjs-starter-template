import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/services/user';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth0User, Auth0UserSchema } from '../user/schemas/user';
import { UserSeeder } from './seeders/user.seeder';

@Module({
  providers: [
    ConfigService,
    AuthService,
    RedisModule,
    UserService,
    SeederService,
    UserSeeder,
  ],
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Auth0User.name, schema: Auth0UserSchema },
    ]),
  ],
})
export class SeederModule {}
