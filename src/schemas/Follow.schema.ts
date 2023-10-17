import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserDocument } from './User.schema';

export type FollowDocument = HydratedDocument<Follow>;

@Schema()
export class Follow {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  followerId: UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  followingId: UserDocument;

  @Prop({ default: Date.now })
  followedDate: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
