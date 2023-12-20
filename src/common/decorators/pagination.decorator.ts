import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export type Pagination = {
  limit: number;
  offset: number;
};

export const PaginationParams = createParamDecorator<Pagination>(
  (data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();

    const { limit, offset } = req.query;

    return {
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
    };
  },
);
