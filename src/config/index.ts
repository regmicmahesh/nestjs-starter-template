import { randomUUID } from 'crypto';
import { Params as LoggerModuleOptions } from 'nestjs-pino';

import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModuleOptions } from '@nestjs/mongoose';

const jwt = registerAs('jwt', () => {
  const config: JwtModuleOptions = {
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '5m' },
  };
  return config;
});

const logger = registerAs('logger', () => {
  const config: Record<string, LoggerModuleOptions> = {
    development: {
      pinoHttp: {
        genReqId: () => randomUUID(),
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },
        autoLogging: true,
        redact: {
          paths: ['req.headers.authorization'],
        },
      },
    },
    test: {
      pinoHttp: {
        genReqId: () => randomUUID(),
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },

        autoLogging: false,
        redact: {
          paths: ['req.headers.authorization'],
        },
      },
    },
    production: {
      pinoHttp: {
        genReqId: (req) => req.headers['x-amzn-trace-id'] || randomUUID(),
        autoLogging: true,
        redact: {
          paths: ['req.headers.authorization'],
        },
      },
    },
  };
  return config[process.env.NODE_ENV || 'development'];
});

const mongo = registerAs('mongo', () => {
  const config: MongooseModuleOptions = {
    uri: process.env.MONGO_URI,
  };
  return config;
});

const redis = registerAs('redis', () => {
  const config: RedisModuleOptions = {
    config: {
      url: process.env.REDIS_URI,
    },
  };
  return config;
});

const aws = registerAs('aws', () => {
  const config: Record<string, any> = {
    development: {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.AWS_ENDPOINT,
      forcePathStyle: true,
      compressLambdaArn: process.env.AWS_COMPRESS_LAMBDA_ARN,
      bucketName: process.env.AWS_STORAGE_BUCKET_NAME,
    },
    production: {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.AWS_ENDPOINT,
      forcePathStyle: true,
      compressLambdaArn: process.env.AWS_COMPRESS_LAMBDA_ARN,
      bucketName: process.env.AWS_STORAGE_BUCKET_NAME,
    },
  };

  return config[process.env.NODE_ENV || 'development'];
});

const auth0 = registerAs('auth0', () => {
  const config: Record<string, any> = {
    development: {
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER,
      algorithm: process.env.AUTH0_ALGORITHM,
      jwkUrl: process.env.AUTH0_JWK_URL,
      management: {
        tenant: process.env.AUTH0_TENANT,
        clientId: process.env.AUTH0_CLIENT_ID,
        secretId: process.env.AUTH0_SECRET_ID,
      },
    },
    production: {
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER,
      algorithm: process.env.AUTH0_ALGORITHM,
      jwkUrl: process.env.AUTH0_JWK_URL,
      management: {
        tenant: process.env.AUTH0_TENANT,
        clientId: process.env.AUTH0_CLIENT_ID,
        secretId: process.env.AUTH0_SECRET_ID,
      },
    },
  };

  return config[process.env.NODE_ENV || 'development'];
});

const seeder = registerAs('seeder', () => {
  const config: Record<string, any> = {
    development: {
      enabled: process.env.SEEDER_ENABLED,
      token: process.env.SEEDER_TOKEN,
    },
    production: {
      enabled: process.env.SEEDER_ENABLED,
      token: process.env.SEEDER_TOKEN,
    },
  };

  return config[process.env.NODE_ENV || 'development'];
});

export default {
  jwt,
  logger,
  mongo,
  redis,
  aws,
  auth0,
  seeder,
};
