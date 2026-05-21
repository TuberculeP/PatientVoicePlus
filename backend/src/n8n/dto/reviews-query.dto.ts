import { IsDateString, IsUUID } from 'class-validator';

export class ReviewsQueryDto {
  @IsUUID()
  centerId: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;
}
