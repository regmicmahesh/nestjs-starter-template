import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Repository } from '../repository';
import { Inject, Injectable } from '@nestjs/common';

type Class = new (...args: unknown[]) => unknown;

export const createExistsRule = (
  serviceClass: Class,
  fieldName: string = '_id',
) => {
  @ValidatorConstraint({ name: ExistsRule.name, async: true })
  @Injectable()
  class ExistsRule implements ValidatorConstraintInterface {
    public readonly service: Repository<unknown>;
    constructor(@Inject(serviceClass) service: Repository<unknown>) {
      this.service = service;
    }

    async validate(value: string) {
      const items = await this.service.find({
        extra: { [fieldName]: value },
      });
      return items.length !== 0;
    }

    defaultMessage(args: ValidationArguments) {
      return `${this.service.getModelName()} with ${fieldName}=${
        args.value
      } already exists`;
    }
  }

  function Exists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        name: Exists.name,
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: ExistsRule,
      });
    };
  }

  return [Exists, ExistsRule] as [typeof Exists, typeof ExistsRule];
};
