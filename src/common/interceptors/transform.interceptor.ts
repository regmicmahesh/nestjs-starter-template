import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiProperty } from '@nestjs/swagger';

export class Response<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty()
  meta: Record<string, any>;

  @ApiProperty()
  errors?: any[];
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {
    this.reflector = reflector;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Response<T>>> {
    const request = await context.switchToHttp().getRequest<Request>();

    let meta: Record<string, any> = {};

    // find better way to do this
    if (request.query.limit) {
      meta.limit = parseInt(request.query.limit as string) || 10;
      meta.offset = parseInt(request.query.offset as string) || 0;
    }

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message:
            this.reflector.get<string>(
              'response_message',
              context.getHandler(),
            ) || '',
          data,
          meta,
          errors: null,
        };
      }),
    );
  }
}
