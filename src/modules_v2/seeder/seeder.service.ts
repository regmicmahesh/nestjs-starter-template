import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { UserService } from '../user/services/user';
import { UserSeeder } from './seeders/user.seeder';
import { Redis } from 'ioredis';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  private readonly token: string;

  private readonly userSeeder: UserSeeder;

  private readonly connection: mongoose.Connection;

  constructor(
    configService: ConfigService,
    @InjectConnection() connection: mongoose.Connection,
    userSeeder: UserSeeder,
  ) {
    this.connection = connection;

    this.token = configService.get<string>('seeder.token');

    this.userSeeder = userSeeder;
  }

  async onApplicationBootstrap() {
    this.logger.log('============================================');
    this.logger.log('Seeding Started');
    this.logger.log(`Seeding Token: ${this.token}`);
    // await this.clean();

    // await this.start();
    this.logger.log('Seeding Complete');
    this.logger.log('============================================');
  }

  private async clean() {
    const collections = await this.connection.db.listCollections().toArray();
    for (let coll of collections) {
      await this.connection.db.dropCollection(coll.name);
    }
    await this.userSeeder.clean(this.token);
  }

  private async start() {
    const users = await this.userSeeder.seed(this.token);
  }
}
