import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}

export class UpdateCommentDto extends PartialType(CommentDto) {}
