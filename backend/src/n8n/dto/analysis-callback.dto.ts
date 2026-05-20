import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AnalysisCallbackDto {
  @IsUUID()
  form_id: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  analyse?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  needs_human_review?: boolean;

  @IsOptional()
  @IsString()
  audit_level?: string;

  @IsOptional()
  @IsBoolean()
  in_quota?: boolean;

  @IsOptional()
  @IsBoolean()
  has_pii?: boolean;

  @IsOptional()
  @IsString()
  error?: string;

  // Champs de debug émis par le post_process_script n8n — ignorés par le service
  @IsOptional()
  @IsString()
  message_original?: string;

  @IsOptional()
  @IsArray()
  tags_llm_bruts?: string[];

  @IsOptional()
  @IsArray()
  tags_rejetes_whitelist?: string[];

  @IsOptional()
  @IsString()
  timestamp?: string;
}
