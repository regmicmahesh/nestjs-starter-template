import {
  Filtering,
  getFilterClauses,
} from '@root/common/decorators/filter.decorator';
import { Model } from 'mongoose';

type FilterArgs = {
  filters?: Filtering[];

  extra?: Record<string, any>;
  pagination?: {
    limit: number;
    offset: number;
  };
};

export abstract class Repository<M, C = any, U = Partial<C>> {
  protected model: Model<M>;

  getModelName(): string {
    return this.model.modelName;
  }

  async create(createDto: C): Promise<M> {
    const object = new this.model(createDto);
    await object.save();
    return object;
  }

  async findOneById(id: string): Promise<M> {
    return this.model.findById(id).exec();
  }

  async find(filterConfig?: FilterArgs): Promise<M[]> {
    const filterClauses = getFilterClauses(filterConfig?.filters);

    return this.model
      .find({ ...filterClauses, ...filterConfig?.extra })
      .skip(filterConfig?.pagination?.offset || 0)
      .limit(filterConfig?.pagination?.limit || 0)
      .exec();
  }

  async updateOne(id: string, updateDto: U): Promise<M> {
    const object = await this.model.findById(id);
    Object.assign(object, updateDto);
    await object.save();
    return object;
  }

  async deleteOne(id: string): Promise<M> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
