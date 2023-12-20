import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Auth0User extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, maxlength: 48, minlength: 2 })
  firstName: string;

  @Prop({ required: true, maxlength: 48, minlength: 2 })
  lastName: string;

  @Prop({ required: true, maxlength: 255, minlength: 4 })
  address: string;

  @Prop({ required: true, maxlength: 255, minlength: 2 })
  city: string;

  @Prop({ required: true, maxlength: 16, minlength: 2 })
  postalCode: string;

  @Prop({ required: false, default: false })
  isOnboarded: boolean;

  @Prop({ required: false, default: false })
  isStaff: boolean;
}

export interface IAuth0User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  isOnboarded?: boolean;
}

export type Auth0UserDocument = HydratedDocument<Auth0User>;

export const Auth0UserSchema = SchemaFactory.createForClass(Auth0User);
