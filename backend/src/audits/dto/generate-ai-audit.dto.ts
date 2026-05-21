import { IsDateString, IsUUID } from 'class-validator';

export class GenerateAiAuditDto {
  @IsUUID()
  centerId: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;
}
