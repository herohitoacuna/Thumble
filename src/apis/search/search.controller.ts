import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { User } from 'src/schemas/User.schema';
import { SearchPostQuery, SearchUserQuery } from 'src/dtos/QueryParams';
import { Post as PostDb } from 'src/schemas/Post.schema';
import { CountData } from 'src/types/paginatedResult';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('/users')
  searchUser(@Query() query: SearchUserQuery): Promise<CountData<User[]>> {
    const { name, page = 1, limit = 1 } = query;

    return this.searchService.searchUser(name, page, limit);
  }

  @Get('/posts')
  searchPost(@Query() query: SearchPostQuery): Promise<CountData<PostDb[]>> {
    const { keyword, page = 1, limit = 1 } = query;

    return this.searchService.searchPost(keyword, page, limit);
  }
}
