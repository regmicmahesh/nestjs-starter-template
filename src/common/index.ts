import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

class Null {}

export const IResponseFormat = (T = Null, isArray = false) => {
  class Response {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: T, isArray })
    data: typeof T;
  }
  Object.defineProperty(Response, 'name', {
    value: `IResponseFormat<${randomUUID()}>`,
  });
  return Response;
};

class Metadata {
  @ApiProperty()
  limit: number;

  @ApiProperty()
  skip: number;
}

export const IPaginatedResponseFormat = (T = Null, isArray = false) => {
  class Response {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: T, isArray })
    data: typeof T;

    @ApiProperty({ type: Metadata })
    $metadata: Metadata;
  }
  Object.defineProperty(Response, 'name', {
    value: `IResponseFormat<${randomUUID()}>`,
  });
  return Response;
};
