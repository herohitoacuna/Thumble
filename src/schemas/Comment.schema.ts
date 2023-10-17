import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PostDocument } from './Post.schema';
import { UserDocument } from './User.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  postId: PostDocument;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
