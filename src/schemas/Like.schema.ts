import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Post, PostDocument } from './Post.schema';
import { User, UserDocument } from './User.schema';

export type VoteDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  postId: PostDocument;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
