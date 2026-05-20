import { AuditStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAuditDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;
}
