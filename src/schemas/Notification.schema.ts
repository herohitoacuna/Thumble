import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserDocument } from './User.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  notificationBy: UserDocument;

  @Prop({ required: true })
  linkTo: string;

  @Prop({ required: true, enum: ['comment', 'post', 'following', 'like'] })
  type: string;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: Date.now })
  createdAt: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
