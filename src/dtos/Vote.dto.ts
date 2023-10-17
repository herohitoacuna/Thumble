import { IsNotEmpty, MinLength } from 'class-validator';

export class VoteDto {
  @IsNotEmpty()
  postId: string;
}
