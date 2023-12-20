import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [AuthService, ConfigService],
  imports: [ConfigModule],
})
export class AuthModule {}
