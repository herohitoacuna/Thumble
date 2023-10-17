import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { skip } from 'node:test';
import { FollowDto } from 'src/dtos/Follow.dto';
import { CreatePostDto, UpdatePostDto } from 'src/dtos/Post.dto';
import { UpdateProfileDto } from 'src/dtos/User.dto';
import { Follow } from 'src/schemas/Follow.schema';
import { Like } from 'src/schemas/Like.schema';
import { Post, PostDocument } from 'src/schemas/Post.schema';
import { User } from 'src/schemas/User.schema';
import { CountData } from 'src/types/paginatedResult';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    return user;
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    userId: string,
  ): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateProfileDto,
      { new: true },
    );

    return updatedUser;
  }

  async deleteProfile(userId: string): Promise<void> {
    return await this.userModel.findByIdAndDelete(userId);
  }

  async getPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Post[]>> {
    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find({ authorId: userId })
      .populate({ path: 'authorId', select: '_id firstname lastname username' })
      .limit(limit)
      .skip(skip);
    const total = await this.postModel.find({ authorId: userId }).count();

    return { page, limit, total, data: posts };
  }

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostDocument> {
    const post = new this.postModel({
      ...createPostDto,
      authorId: userId,
    });
    return await post.save();
  }

  async updatePost(
    updatePostDto: UpdatePostDto,
    postId: string,
  ): Promise<Post> {
    // If DTO is empty, it should not perform the query. It helps the database to unecessary queries
    if (Object.keys(updatePostDto).length === 0) {
      throw new HttpException(
        'No data to be updated',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const updatedPost = await this.postModel.findByIdAndUpdate(
      postId,
      { ...updatePostDto, lastModified: new Date() },
      { new: true },
    );

    return updatedPost;
  }

  async deletePost(postId: string): Promise<void> {
    return await this.postModel.findByIdAndDelete(postId);
  }

  async getFollowers(userId: string) {
    return await this.followModel.find({ followingId: userId });
  }

  async followUser(followDto: FollowDto): Promise<Follow> {
    const follow = new this.followModel(followDto);
    return await follow.save();
  }

  async unfollowUser(followDto: FollowDto): Promise<void> {
    return await this.followModel.findOneAndDelete(followDto);
  }

  async getLikedPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Like[]>> {
    const skip = (page - 1) * limit;

    const likedPost = await this.likeModel
      .find({ userId })
      .populate('postId')
      .limit(limit)
      .skip(skip);
    const total = await this.likeModel.find({ userId }).count();

    return {
      page,
      limit,
      total,
      data: likedPost,
    };
  }

  async getUserDetails(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId, {
      password: 0,
      email: 0,
      lastModified: 0,
    });
    return user;
  }

  async getUserPosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Post[]>> {
    const skip = (page - 1) * limit;

    const postsPromise = this.postModel
      .find({ authorId: userId })
      .populate({ path: 'authorId', select: '_id firstname lastname username' })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.postModel.find({ authorId: userId }).count();

    const [posts, total] = await Promise.all([postsPromise, totalPromise]);

    return { page, limit, total, data: posts };
  }

  async getUserFollowers(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Follow[]>> {
    const skip = (page - 1) * limit;

    const followersPromise = this.followModel
      .find({ followingId: userId })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.followModel.find({ followingId: userId }).count();

    const [followers, total] = await Promise.all([
      followersPromise,
      totalPromise,
    ]);

    return {
      page,
      limit,
      total,
      data: followers,
    };
  }

  async getUserFollowing(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Follow[]>> {
    const skip = (page - 1) * limit;

    const followingPromise = this.followModel
      .find({ followerId: userId })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.followModel.find({ followerId: userId }).count();

    const [following, total] = await Promise.all([
      followingPromise,
      totalPromise,
    ]);

    return {
      page,
      limit,
      total,
      data: following,
    };
  }
}
