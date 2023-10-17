import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDto, UpdateCommentDto } from 'src/dtos/Comment.dto';
import { FilterQuery } from 'src/dtos/QueryParams';
import { Comment } from 'src/schemas/Comment.schema';
import { Like } from 'src/schemas/Like.schema';
import { Post } from 'src/schemas/Post.schema';
import { CountData } from 'src/types/paginatedResult';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async getFeed(page: number, limit: number): Promise<CountData<Post[]>> {
    const skip = (page - 1) * limit;

    const postsPromise = this.postModel
      .find()
      .populate({ path: 'authorId', select: '_id firstname lastname photo' })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.postModel.find().count();

    const [posts, total] = await Promise.all([postsPromise, totalPromise]);

    return {
      page,
      limit,
      total,
      data: posts.sort(() => Math.random() - 0.5),
    };
  }

  async getFiltered(query: FilterQuery): Promise<CountData<Post[]>> {
    const page = query.page || 1;
    const limit = query.limit || 1;
    const skip = (page - 1) * limit;

    const filteredPostsPromise = this.postModel
      .find({ tags: query.category })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.postModel.find({ tags: query.category }).count();

    const [filteredPosts, total] = await Promise.all([
      filteredPostsPromise,
      totalPromise,
    ]);

    return {
      page,
      limit,
      total,
      data: filteredPosts,
    };
  }

  async getTrend(): Promise<Post[]> {
    return await this.likeModel.aggregate([
      { $group: { _id: 'postId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
  }

  async getPost(postId: string): Promise<Post> {
    return (await this.postModel.findById(postId)).populate({
      path: 'authorId',
      select: 'id firstname lastname username email photo',
    });
  }

  async getLikes(
    postId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Like[]>> {
    const skip = (page - 1) * limit;

    const total = await this.likeModel.find({ postId }).count();
    const likes = await this.likeModel.find({ postId }).limit(limit).skip(skip);

    return { page, limit, total, data: likes };
  }

  async likePost(postId: string, userId: string): Promise<Like> {
    const liked = await this.likeModel.findOne({ postId, userId });
    if (liked) throw new HttpException('Already liked', HttpStatus.BAD_REQUEST);
    return await new this.likeModel({ userId, postId }).save();
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    await this.likeModel.findOneAndDelete({ postId, userId });
  }

  async getComments(
    postId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Comment[]>> {
    const skip = (page - 1) * limit;

    const total = await this.commentModel.find({ postId }).count();
    const comment = await this.commentModel
      .find({ postId })
      .limit(limit)
      .skip(skip);

    return {
      page,
      limit,
      total,
      data: comment,
    };
  }

  async createComment(
    { content }: CommentDto,
    postId: string,
    userId: string,
  ): Promise<Comment> {
    return await new this.commentModel({
      content,
      postId,
      userId,
    }).save();
  }

  async updateComment(commentId: string, updateComment: UpdateCommentDto) {
    return await this.commentModel.findByIdAndUpdate(commentId, updateComment, {
      new: true,
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(commentId);
  }
}
