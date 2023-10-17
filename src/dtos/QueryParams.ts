import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Tags } from './Post.dto';

export class PaginationQuery {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit: number;
}

export class FilterQuery extends PaginationQuery {
  @IsEnum(Tags, {})
  category: Tags;
}

export class SearchUserQuery extends PaginationQuery {
  @IsNotEmpty()
  name: string;
}

export class SearchPostQuery extends PaginationQuery {
  @IsNotEmpty()
  keyword: string;
}
