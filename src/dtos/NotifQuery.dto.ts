import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class NotifQuery {
  @IsDefined()
  @Transform((value) => Number(value))
  page: number;

  @IsDefined()
  @Transform((value) => Number(value))
  lim: number;
}
