import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Repository } from '../repository';
import { Inject, Injectable } from '@nestjs/common';

type Class = new (...args: unknown[]) => Repository<unknown>;

export const createNotExistsRule = (
  serviceClass: Class,
  fieldName: string = '_id',
) => {
  @ValidatorConstraint({ name: NotExistsRule.name, async: true })
  @Injectable()
  class NotExistsRule implements ValidatorConstraintInterface {
    public readonly service: Repository<unknown>;
    constructor(@Inject(serviceClass) service: Repository<unknown>) {
      this.service = service;
    }

    async validate(value: string) {
      const items = await this.service.find({
        extra: {
          [fieldName]: value,
        },
      });
      return items.length === 0;
    }

    defaultMessage(args: ValidationArguments) {
      this.service;
      return `${this.service.getModelName()} with ${fieldName}=${
        args.value
      } already exists`;
    }
  }

  function NotExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        name: NotExists.name,
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: NotExistsRule,
      });
    };
  }

  return [NotExists, NotExistsRule] as [typeof NotExists, typeof NotExistsRule];
};
