import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from '../interceptors/transform.interceptor';

export const ApiResponsePaginated = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  statusCode: number = HttpStatus.OK,
) =>
  applyDecorators(
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiExtraModels(Response, dataDto),
    ApiResponse({
      status: statusCode,
      schema: {
        allOf: [
          { $ref: getSchemaPath(Response) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

export const ApiResponseSingle = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  statusCode: number = HttpStatus.OK,
) =>
  applyDecorators(
    ApiExtraModels(Response, dataDto),
    ApiResponse({
      status: statusCode,
      schema: {
        allOf: [
          { $ref: getSchemaPath(Response) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  );
