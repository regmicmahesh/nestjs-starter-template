import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    let errors: Record<string, any> | string = {};

    errors = exception.getResponse()['message'];

    this.logger.error(
      `${request.method} ${request.url}  ${exception.message}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response.status(statusCode).json({
      statusCode,
      // this is hack to remove errors if it is equal to exception message
      // because we are sending exception message as errors
      errors: errors === exception.message ? undefined : errors,
      data: null,
      path: request.url,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
