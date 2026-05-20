import { IsUUID } from 'class-validator';

export class GenerateAuditDto {
  @IsUUID()
  centerId: string;
}
