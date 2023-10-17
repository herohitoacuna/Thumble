import { IsNotEmpty } from 'class-validator';

export class FollowDto {
  @IsNotEmpty()
  followingId: string;

  @IsNotEmpty()
  followerId: string;
}
