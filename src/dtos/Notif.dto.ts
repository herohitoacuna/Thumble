import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';

enum NotifTypes {
  POST = 'post',
  COMMENT = 'comment',
  FOLLOWING = 'following',
  VOTE = 'vote',
}

export class NotificationDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @IsNotEmpty()
  @MinLength(1)
  description: string;

  @IsEnum(NotifTypes)
  type: NotifTypes;
}
