import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemas/Post.schema';
import { User } from 'src/schemas/User.schema';
import { CountData } from 'src/types/paginatedResult';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async searchUser(
    name: string,
    page: number,
    limit: number,
  ): Promise<CountData<User[]>> {
    const skip = (page - 1) * limit;

    const searchUserPromise = this.userModel
      .find(
        {
          $text: { $search: name },
        },
        { score: { $meta: 'textScore' } },
      )
      .select('_id firstname lastname username photo')
      .limit(limit)
      .skip(skip)
      .sort({ score: 'desc' });

    const totalPromise = this.userModel
      .find({
        $text: { $search: name },
      })
      .count();

    const [searchUser, total] = await Promise.all([
      searchUserPromise,
      totalPromise,
    ]);

    return { page, limit, total, data: searchUser };
  }

  async searchPost(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<CountData<Post[]>> {
    const skip = (page - 1) * limit;

    const searchPostPromise = this.postModel
      .find(
        {
          $text: { $search: keyword },
        },
        { score: { $meta: 'textScore' } },
      )
      .select('_id authorId title content createdAt')
      .populate({
        path: 'authorId',
        select: '_id firstname lastname username photo',
      })
      .limit(limit)
      .skip(skip)
      .sort({ score: 'desc' });

    const totalPromise = this.postModel
      .find({
        $text: { $search: keyword },
      })
      .count();

    const [searchPost, total] = await Promise.all([
      searchPostPromise,
      totalPromise,
    ]);

    return { page, limit, total, data: searchPost };
  }
}
