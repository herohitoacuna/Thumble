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
import { FilterQuery, PaginationQuery } from 'src/dtos/QueryParams';
import { CommentDto, UpdateCommentDto } from 'src/dtos/Comment.dto';
import { AuthenticatedRequest } from 'src/types/request.type';
import { CountData } from 'src/types/paginatedResult';
import { Post as PostDb } from 'src/schemas/Post.schema';
import { Like } from 'src/schemas/Like.schema';
import { Comment } from 'src/schemas/Comment.schema';
import { NotificationGateway } from '../notifications/notification.gateway';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostsService,
    private notifGateway: NotificationGateway,
  ) {}

  @Get('feed')
  getFeed(@Query() query: PaginationQuery): Promise<CountData<PostDb[]>> {
    const { page = 1, limit = 1 } = query;
    return this.postService.getFeed(page, limit);
  }

  @Get('filter')
  getFilteredPosts(@Query() query: FilterQuery): Promise<CountData<PostDb[]>> {
    return this.postService.getFiltered(query);
  }

  @Get('trends')
  getTrendPosts(): Promise<PostDb[]> {
    return this.postService.getTrend();
  }

  @Get('post/:postId')
  getPost(@Param('postId') postId: string): Promise<PostDb> {
    return this.postService.getPost(postId);
  }

  @Get('post/:postId/likes')
  getLikes(
    @Param('postId') postId: string,
    @Query() query: PaginationQuery,
  ): Promise<CountData<Like[]>> {
    const { page = 1, limit = 1 } = query;
    return this.postService.getLikes(postId, page, limit);
  }

  @Get('post/:postId/comments')
  getComments(
    @Param('postId') postId: string,
    @Query() query: PaginationQuery,
  ): Promise<CountData<Comment[]>> {
    const { page = 1, limit = 1 } = query;
    return this.postService.getComments(postId, page, limit);
  }

  @UseGuards(AuthGuard)
  @Post('post/:postId/likes')
  async likePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Like> {
    // notify the author
    this.notifGateway.newLikeNotifyAuthor(postId, req.user.id);
    return await this.postService.likePost(postId, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('post/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
    @Body() commentDto: CommentDto,
  ) {
    // notify the author
    this.notifGateway.newCommentNotifyAuthor(postId, req.user.id);

    return await this.postService.createComment(
      commentDto,
      postId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('post/:postId/comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.postService.updateComment(commentId, updateCommentDto);
  }

  @UseGuards(AuthGuard)
  @Delete('post/:postId/likes')
  removeLike(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.postService.removeLike(postId, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('post/:postId/comments/:commentId')
  deleteComment(@Param('commentId') commentId: string): Promise<void> {
    return this.postService.deleteComment(commentId);
  }
}
