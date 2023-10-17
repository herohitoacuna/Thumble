import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/schemas/User.schema';
import { Post, PostSchema } from 'src/schemas/Post.schema';
import { Comment, CommentSchema } from 'src/schemas/Comment.schema';
import { Follow, FollowSchema } from 'src/schemas/Follow.schema';
import { Like, LikeSchema } from 'src/schemas/Like.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/Notification.schema';

import { AuthenticationController } from './authentication/auth.controller';
import { AuthenticationService } from './authentication/auth.service';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TokenService } from 'src/lib/token';
import { NotificationService } from './notifications/notifications.service';
import { NotificationController } from './notifications/notifications.controller';
import { NotificationGateway } from './notifications/notification.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [
    AuthenticationController,
    PostsController,
    SearchController,
    UsersController,
    NotificationController,
  ],
  providers: [
    AuthenticationService,
    PostsService,
    SearchService,
    UsersService,
    TokenService,
    NotificationService,
    NotificationGateway,
  ],
})
export class ApiModule {}
