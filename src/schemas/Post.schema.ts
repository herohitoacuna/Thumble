import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserDocument } from './User.schema';
import { Tags } from 'src/dtos/Post.dto';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  authorId: UserDocument;

  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], enum: Tags })
  tags: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text' });
PostSchema.index({ content: 'text' });
