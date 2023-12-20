import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import config from './config';
import { UserModule } from './modules_v2/user/user.module';
import { AuthModule } from './modules_v2/auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { FilesModule } from './modules_v2/files/files.module';
import { SeederModule } from './modules_v2/seeder/seeder.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [
        config.jwt,
        config.logger,
        config.mongo,
        config.redis,
        config.aws,
        config.auth0,
        config.seeder,
      ],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => configService.get('jwt'),
      global: true,
      inject: [ConfigService],
    }),

    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('logger'),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('mongo'),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    FilesModule,

    ...(process.env['SEEDER_ENABLED'] === 'true' ? [SeederModule] : []),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) =>
          new BadRequestException(
            errors.map((error) => ({
              property: error.property,
              constraints: error.constraints,
            })),
          ),
      }),
    },
  ],
})
export class AppModule {}
