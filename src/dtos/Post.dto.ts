import { ArrayNotEmpty, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum Tags {
  Social = 'social',
  Science = 'science',
  Technology = 'technology',
  History = 'history',
  Research = 'research',
  Music = 'music',
  Movies = 'movies',
}

export class CreatePostDto {
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsNotEmpty()
  @MinLength(5)
  content: string;

  @ArrayNotEmpty()
  @IsEnum(Tags, { each: true })
  tags: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
