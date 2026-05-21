import { IsString, IsUUID } from 'class-validator';

export class CreateAuditDraftDto {
  @IsUUID()
  centerId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
