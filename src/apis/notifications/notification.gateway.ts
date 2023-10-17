import { InjectModel } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/lib/token';
import { Follow, FollowDocument } from 'src/schemas/Follow.schema';
import { Notification } from 'src/schemas/Notification.schema';
import { Post, PostDocument } from 'src/schemas/Post.schema';
import { User } from 'src/schemas/User.schema';

export enum NotificationEvent {
  NewPost = 'new-post',
  NewFollower = 'new-follower',
  NewComment = 'new-comment',
  NewLike = 'new-like',
}

export enum NotificationType {
  Post = 'post',
  Comment = 'comment',
  Following = 'following',
  Like = 'like',
}

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    private tokenService: TokenService,
  ) {}

  afterInit(server: any) {}

  handleConnection(client: Socket) {
    console.log(client.id + ' is connected');
    // const { token } = client.handshake.auth;
    // this.tokenService
    //   .validate(token)
    //   .then((payload) => {
    //     console.log(`${payload.email} is connected, SocketId: ${client.id}`);
    //     client.join(payload.id);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     throw new WsException('Invalid credentials. Please login!');
    //   });
  }

  handleDisconnect(client: Socket) {
    console.log(`SocketId: ${client.id}, Disconnected`);
  }

  // notify the followers if client have new post
  async newPostNotifyFollowers(userId: string, followersId: string[]) {
    try {
      const notificationsPromise = followersId.map((follower) => {
        const notification = new this.notifModel({
          userId: follower,
          notificationBy: userId,
          linkTo: userId,
          type: NotificationType.Post,
        }).save();

        return notification;
      });

      const notifications = await Promise.all(notificationsPromise);

      notifications.forEach((notification) => {
        this.server
          .to(followersId)
          .emit(NotificationEvent.NewPost, notification);
      });
    } catch (error) {
      console.error(error);
      throw new WsException('Websocket Error ' + error);
    }
  }

  // notify the if client followed another user
  async newFollowerNotifyUser(followingId: string, followerId: string) {
    try {
      const userNotification = await new this.notifModel({
        userId: followingId,
        notificationBy: followerId,
        linkTo: followerId,
        type: NotificationType.Following,
      }).save();

      this.server
        .to(followingId)
        .emit(NotificationEvent.NewFollower, userNotification);
    } catch (error) {
      console.error(error);
      throw new WsException('Websocket Error ' + error);
    }
  }

  // notify the author of the post if there is new comment
  async newCommentNotifyAuthor(postId: string, userId: string) {
    try {
      const post = await this.postModel.findById(postId);
      const authorNotification = await new this.notifModel({
        userId: post.authorId,
        notificationBy: userId,
        linkTo: postId,
        type: NotificationType.Comment,
      }).save();

      this.server
        .to(post.authorId.toString())
        .emit(NotificationEvent.NewComment, authorNotification);
    } catch (error) {
      console.error(error);
      throw new WsException('Websocket Error ' + error);
    }
  }

  async newLikeNotifyAuthor(postId: string, userId: string) {
    try {
      const post = await this.postModel.findById(postId);
      const authorNotification = await new this.notifModel({
        userId: post.authorId,
        notificationBy: userId,
        linkTo: postId,
        type: NotificationType.Like,
      }).save();

      this.server
        .to(post.authorId.toString())
        .emit(NotificationEvent.NewFollower, authorNotification);
    } catch (error) {
      console.error(error);
      throw new WsException('Websocket Error ' + error);
    }
  }
}
