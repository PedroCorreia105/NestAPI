import { ApiProperty } from '@nestjs/swagger';

import { Edge } from './edge.dto';
import { PageInfo } from './page-info.dto';

export class Page<T> {
  edges: Edge<T>[];

  @ApiProperty()
  pageInfo: PageInfo;

  @ApiProperty()
  totalCount: number;

  constructor(partial: Partial<Page<T>>) {
    Object.assign(this, partial);
  }
}
