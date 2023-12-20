import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export interface Filtering {
  property: string;
  rule: FilterRule;
  value: string;
}

export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
  SEARCH = 'search',
}

export const FilteringParams = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const filter = req.query.filter as string;
    if (!filter) {
      return [];
    }

    if (typeof data != 'object')
      throw new BadRequestException('Invalid filter parameter');

    if (typeof filter === 'string') {
      return [processFilter(filter, data)];
    }

    if (Array.isArray(filter)) {
      return (filter as string[]).map((f) => processFilter(f, data));
    }
  },
);

const processFilter = (filter: string, data: any): Filtering => {
  if (
    !filter.match(
      /^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|in|nin|search):[a-zA-Z0-9_,@\.\|]+$/,
    ) &&
    !filter.match(/^[a-zA-Z0-9_]+:(isnull|isnotnull)$/)
  ) {
    throw new BadRequestException('Invalid filter parameter');
  }

  const [property, rule, value] = filter.split(':');

  if (!data.includes(property))
    throw new BadRequestException(`Invalid filter property: ${property}`);
  if (!Object.values(FilterRule).includes(rule as FilterRule))
    throw new BadRequestException(`Invalid filter rule: ${rule}`);

  const filteringRule = rule as FilterRule;
  return { property, rule: filteringRule, value };
};

export const getFilterClauses = (filters?: Filtering[]) => {
  if (!filters) return {};

  return filters.reduce((acc, filter) => {
    return { ...acc, ...processFilterClause(filter) };
  }, {});
};

const processFilterClause = (filter: Filtering) => {
  if (!filter) return {};

  const { property, rule, value } = filter;

  const filterClause = {};

  if (rule === FilterRule.IS_NULL) {
    filterClause[property] = { $exists: false };
  }

  if (rule === FilterRule.IS_NOT_NULL) {
    filterClause[property] = { $exists: true };
  }

  if (rule === FilterRule.EQUALS) {
    filterClause[property] = value;
  }

  if (rule === FilterRule.NOT_EQUALS) {
    filterClause[property] = { $ne: value };
  }

  if (rule === FilterRule.GREATER_THAN) {
    filterClause[property] = { $gt: value };
  }

  if (rule === FilterRule.GREATER_THAN_OR_EQUALS) {
    filterClause[property] = { $gte: value };
  }

  if (rule === FilterRule.LESS_THAN) {
    filterClause[property] = { $lt: value };
  }

  if (rule === FilterRule.LESS_THAN_OR_EQUALS) {
    filterClause[property] = { $lte: value };
  }

  if (rule === FilterRule.IN) {
    filterClause[property] = { $in: value.split(',') };
  }

  if (rule === FilterRule.NOT_IN) {
    filterClause[property] = { $nin: value.split(',') };
  }
  if (rule === FilterRule.SEARCH) {
    filterClause[property] = { $regex: value, $options: 'i' };
  }

  return filterClause;
};
