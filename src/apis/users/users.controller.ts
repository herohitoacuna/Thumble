import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthenticatedRequest } from 'src/types/request.type';
import { User } from 'src/schemas/User.schema';
import { UpdateProfileDto } from 'src/dtos/User.dto';
import { Post as PostDb } from 'src/schemas/Post.schema';
import { PaginationQuery } from 'src/dtos/QueryParams';
import { CountData } from 'src/types/paginatedResult';
import { CreatePostDto, UpdatePostDto } from 'src/dtos/Post.dto';
import { Like } from 'src/schemas/Like.schema';
import { Follow } from 'src/schemas/Follow.schema';
import { NotificationGateway } from '../notifications/notification.gateway';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private notifGateway: NotificationGateway,
  ) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest): Promise<User> {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<User> {
    return this.usersService.updateProfile(updateProfileDto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('profile')
  deleteProfile(@Req() req: AuthenticatedRequest): Promise<void> {
    return this.usersService.deleteProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('posts')
  getPosts(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQuery,
  ): Promise<CountData<PostDb[]>> {
    const { page = 1, limit = 5 } = query;
    return this.usersService.getPosts(req.user.id, page, limit);
  }

  @UseGuards(AuthGuard)
  @Post('posts')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PostDb> {
    const postPromise = this.usersService.createPost(
      createPostDto,
      req.user.id,
    );
    const followersPromise = this.usersService.getFollowers(req.user.id);

    const [post, followers] = await Promise.all([
      postPromise,
      followersPromise,
    ]);

    const followersId = followers.map((follower) => follower.id);

    // Notify followers
    await this.notifGateway.newPostNotifyFollowers(req.user.id, followersId);
    return post;
  }

  @UseGuards(AuthGuard)
  @Patch('posts/:postId')
  updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('postId') postId: string,
  ): Promise<PostDb> {
    return this.usersService.updatePost(updatePostDto, postId);
  }

  @UseGuards(AuthGuard)
  @Delete('posts/:postId')
  deletePost(@Param('postId') postId: string): Promise<void> {
    return this.usersService.deletePost(postId);
  }

  @UseGuards(AuthGuard)
  @Get('posts/like')
  getLikedPosts(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQuery,
  ): Promise<CountData<Like[]>> {
    const { page = 1, limit = 5 } = query;
    return this.usersService.getLikedPosts(req.user.id, page, limit);
  }

  @UseGuards(AuthGuard)
  @Post('follow/:followingId')
  followUser(
    @Param('followingId') followingId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Follow> {
    // notify the following
    this.notifGateway.newFollowerNotifyUser(followingId, req.user.id);

    return this.usersService.followUser({
      followerId: req.user.id,
      followingId,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('follow/:followingId')
  unfollowUser(
    @Param('followingId') followingId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.usersService.unfollowUser({
      followerId: req.user.id,
      followingId,
    });
  }

  @Get(':userId/details')
  getUserDetails(@Param('userId') userId: string): Promise<User> {
    return this.usersService.getUserDetails(userId);
  }

  @Get(':userId/posts')
  getUserPosts(
    @Param('userId') userId: string,
    @Query() query: PaginationQuery,
  ): Promise<CountData<PostDb[]>> {
    const { page = 1, limit = 1 } = query;
    return this.usersService.getUserPosts(userId, page, limit);
  }

  @Get(':userId/followers')
  getUserFollowers(
    @Param('userId') userId: string,
    @Query() query: PaginationQuery,
  ): Promise<CountData<Follow[]>> {
    const { page = 1, limit = 1 } = query;
    return this.usersService.getUserFollowers(userId, page, limit);
  }

  @Get(':userId/following')
  getUserFollowing(
    @Param('userId') userId: string,
    @Query() query: PaginationQuery,
  ): Promise<CountData<Follow[]>> {
    const { page = 1, limit = 1 } = query;
    return this.usersService.getUserFollowing(userId, page, limit);
  }
}
